import { Octokit } from "@octokit/rest";
import { createNodeMiddleware } from "@octokit/webhooks";
import { WebhookEventMap } from "@octokit/webhooks-definitions/schema";
import * as http from "http";
import { App } from "octokit";
import { Review } from "./constants";
import { env } from "./env";
import { processPullRequest } from "./review-agent";
import { applyReview } from "./reviews";
import { logger } from "./utils/logger";
import { config } from "./utils/config";

// This creates a new instance of the Octokit App class.
const reviewApp = new App({
  appId: env.GITHUB_APP_ID,
  privateKey: env.GITHUB_PRIVATE_KEY,
  webhooks: {
    secret: env.GITHUB_WEBHOOK_SECRET,
  },
});

const getChangesPerFile = async (payload: WebhookEventMap["pull_request"]) => {
  try {
    logger.debug("Fetching changed files for PR", {
      repo: payload.repository.full_name,
      pr: payload.pull_request.number,
    });

    const octokit = await reviewApp.getInstallationOctokit(
      payload.installation.id
    );
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      pull_number: payload.pull_request.number,
    });

    logger.info(
      `Found ${files.length} changed files in PR #${payload.pull_request.number}`
    );
    logger.debug(
      "Changed files:",
      files.map((f) => f.filename)
    );

    return files;
  } catch (error) {
    logger.error("Failed to fetch changed files:", error);
    return [];
  }
};

// This adds an event handler that your code will call later. When this event handler is called, it will log the event to the console. Then, it will use GitHub's REST API to add a comment to the pull request that triggered the event.
async function handlePullRequestOpened({
  octokit,
  payload,
}: {
  octokit: Octokit;
  payload: WebhookEventMap["pull_request"];
}) {
  const prNumber = payload.pull_request.number;
  const repoFullName = payload.repository.full_name;

  logger.info(`🔍 Processing PR #${prNumber} in ${repoFullName}`);

  const cfg = config.get();

  try {
    logger.debug("Repository info:", {
      id: payload.repository.id,
      fullName: payload.repository.full_name,
      url: payload.repository.html_url,
    });

    const files = await getChangesPerFile(payload);

    if (files.length === 0) {
      logger.warn(`No files found for PR #${prNumber}, skipping review`);
      return;
    }

    if (files.length > cfg.maxFilesPerReview) {
      logger.warn(
        `PR #${prNumber} has ${files.length} files, which exceeds the limit of ${cfg.maxFilesPerReview}. Some files may not be reviewed.`
      );
    }

    logger.info(
      `🚀 Starting ${
        cfg.enableAgenticReview ? "agentic" : "traditional"
      } review process...`
    );

    const review: Review = await processPullRequest(
      octokit,
      payload,
      files,
      true
    );

    if (review.review) {
      await applyReview({ octokit, payload, review });
      logger.success(`✅ Review completed and posted for PR #${prNumber}`);
    } else {
      logger.warn(`No review generated for PR #${prNumber}`);
    }
  } catch (error) {
    logger.error(`❌ Failed to process PR #${prNumber}:`, error);
  }
}

// This sets up a webhook event listener. When your app receives a webhook event from GitHub with a `X-GitHub-Event` header value of `pull_request` and an `action` payload value of `opened`, it calls the `handlePullRequestOpened` event handler that is defined above.
//@ts-ignore
reviewApp.webhooks.on("pull_request.opened", handlePullRequestOpened);

const port = process.env.PORT || 3000;
const reviewWebhook = `/api/review`;

const reviewMiddleware = createNodeMiddleware(reviewApp.webhooks, {
  path: "/api/review",
});

const server = http.createServer((req, res) => {
  if (req.url === reviewWebhook) {
    reviewMiddleware(req, res);
  } else {
    res.statusCode = 404;
    res.end();
  }
});

// This creates a Node.js server that listens for incoming HTTP requests (including webhook payloads from GitHub) on the specified port. When the server receives a request, it executes the `middleware` function that you defined earlier. Once the server is running, it logs messages to the console to indicate that it is listening.
server.listen(port, () => {
  logger.success(`🚀 CodeScribe Agent is running on port ${port}`);
  logger.info(`📡 Webhook endpoint: http://localhost:${port}${reviewWebhook}`);
  logger.info(
    `🤖 Agentic review: ${
      config.get().enableAgenticReview ? "ENABLED" : "DISABLED"
    }`
  );
  logger.info("Press Ctrl + C to quit.");
});
