import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessage,
} from "groq-sdk/resources/chat/completions";
import { groq, GROQ_MODEL } from "./groq";
import { logger } from "../utils/logger";
import { config } from "../utils/config";

export const generateChatCompletion = async (
  options: Omit<ChatCompletionCreateParamsNonStreaming, "model">,
  retryCount = 0
): Promise<ChatCompletionMessage> => {
  const cfg = config.get();

  try {
    logger.debug(
      `Making chat completion request (attempt ${retryCount + 1}/${
        cfg.retryAttempts + 1
      })`
    );

    const response = await groq.chat.completions.create({
      model: cfg.primaryModel as any,
      temperature: cfg.temperature,
      ...options,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No choices returned from chat completion");
    }

    const message = response.choices[0].message;
    if (!message.content) {
      logger.warn("Chat completion returned empty content");
    }

    logger.debug("Chat completion successful");
    return message;
  } catch (error) {
    logger.error(`Chat completion error (attempt ${retryCount + 1}):`, error);

    // Rate limiting or temporary errors - retry with exponential backoff
    if (
      retryCount < cfg.retryAttempts &&
      (error.status === 429 ||
        error.status >= 500 ||
        error.code === "ECONNRESET")
    ) {
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      logger.info(`Retrying chat completion in ${delay}ms...`);

      await new Promise((resolve) => setTimeout(resolve, delay));
      return generateChatCompletion(options, retryCount + 1);
    }

    // Try fallback model if available
    if (cfg.fallbackModel && retryCount === 0) {
      logger.info(`Trying fallback model: ${cfg.fallbackModel}`);
      try {
        const fallbackResponse = await groq.chat.completions.create({
          model: cfg.fallbackModel as any,
          temperature: cfg.temperature,
          ...options,
        });
        return fallbackResponse.choices[0].message;
      } catch (fallbackError) {
        logger.error("Fallback model also failed:", fallbackError);
      }
    }

    throw error;
  }
};
