import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import { generateChatCompletion } from "./chat";
import { logger } from "../utils/logger";
import { config } from "../utils/config";

export interface AgentReviewResult {
  type:
    | "security"
    | "performance"
    | "code_quality"
    | "documentation"
    | "testing";
  feedback: string;
  suggestions: Array<{
    line_start?: number;
    line_end?: number;
    file: string;
    issue: string;
    suggestion: string;
    severity: "low" | "medium" | "high" | "critical";
  }>;
}

export class ReviewAgent {
  /**
   * Security-focused review agent
   */
  static async securityReview(diff: string): Promise<AgentReviewResult> {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a security expert reviewing code changes. Focus on:
- SQL injection vulnerabilities
- XSS vulnerabilities  
- Authentication/authorization issues
- Data validation problems
- Sensitive data exposure
- Insecure dependencies
- CORS misconfigurations

Respond in JSON format with:
{
  "feedback": "Overall security assessment",
  "suggestions": [
    {
      "file": "filename",
      "line_start": number,
      "line_end": number, 
      "issue": "Security issue description",
      "suggestion": "How to fix it",
      "severity": "low|medium|high|critical"
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Review this code diff for security vulnerabilities:\n\n${diff}`,
      },
    ];

    const response = await generateChatCompletion({ messages });
    try {
      const parsed = JSON.parse(response.content || "{}");
      return {
        type: "security",
        feedback: parsed.feedback || "No security issues detected.",
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      return {
        type: "security",
        feedback: response.content || "Security review completed.",
        suggestions: [],
      };
    }
  }

  /**
   * Performance-focused review agent
   */
  static async performanceReview(diff: string): Promise<AgentReviewResult> {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a performance expert reviewing code changes. Focus on:
- Algorithm efficiency (O(n) complexity)
- Database query optimization
- Memory usage patterns
- Caching opportunities
- Unnecessary loops or iterations
- Blocking operations
- Resource leaks

Respond in JSON format with:
{
  "feedback": "Overall performance assessment",
  "suggestions": [
    {
      "file": "filename",
      "line_start": number,
      "line_end": number,
      "issue": "Performance issue description", 
      "suggestion": "How to optimize it",
      "severity": "low|medium|high|critical"
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Review this code diff for performance issues:\n\n${diff}`,
      },
    ];

    const response = await generateChatCompletion({ messages });
    try {
      const parsed = JSON.parse(response.content || "{}");
      return {
        type: "performance",
        feedback: parsed.feedback || "No performance issues detected.",
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      return {
        type: "performance",
        feedback: response.content || "Performance review completed.",
        suggestions: [],
      };
    }
  }

  /**
   * Code quality-focused review agent
   */
  static async codeQualityReview(diff: string): Promise<AgentReviewResult> {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a code quality expert reviewing code changes. Focus on:
- Code readability and clarity
- Naming conventions
- Function/method length and complexity
- DRY principle violations
- SOLID principles
- Error handling
- Code organization and structure
- TypeScript/type safety

Respond in JSON format with:
{
  "feedback": "Overall code quality assessment",
  "suggestions": [
    {
      "file": "filename", 
      "line_start": number,
      "line_end": number,
      "issue": "Code quality issue description",
      "suggestion": "How to improve it",
      "severity": "low|medium|high|critical"
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Review this code diff for code quality issues:\n\n${diff}`,
      },
    ];

    const response = await generateChatCompletion({ messages });
    try {
      const parsed = JSON.parse(response.content || "{}");
      return {
        type: "code_quality",
        feedback: parsed.feedback || "Code quality looks good.",
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      return {
        type: "code_quality",
        feedback: response.content || "Code quality review completed.",
        suggestions: [],
      };
    }
  }

  /**
   * Documentation-focused review agent
   */
  static async documentationReview(diff: string): Promise<AgentReviewResult> {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a documentation expert reviewing code changes. Focus on:
- Missing function/method documentation
- Incomplete or unclear comments
- README updates needed
- API documentation
- Type definitions documentation
- Example usage
- Changelog updates

Respond in JSON format with:
{
  "feedback": "Overall documentation assessment",
  "suggestions": [
    {
      "file": "filename",
      "line_start": number,
      "line_end": number,
      "issue": "Documentation issue description",
      "suggestion": "What documentation to add",
      "severity": "low|medium|high|critical"
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Review this code diff for documentation needs:\n\n${diff}`,
      },
    ];

    const response = await generateChatCompletion({ messages });
    try {
      const parsed = JSON.parse(response.content || "{}");
      return {
        type: "documentation",
        feedback: parsed.feedback || "Documentation looks adequate.",
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      return {
        type: "documentation",
        feedback: response.content || "Documentation review completed.",
        suggestions: [],
      };
    }
  }

  /**
   * Testing-focused review agent
   */
  static async testingReview(diff: string): Promise<AgentReviewResult> {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a testing expert reviewing code changes. Focus on:
- Missing unit tests for new functions
- Integration test coverage
- Edge case testing
- Error condition testing
- Mock usage
- Test organization
- Test naming conventions

Respond in JSON format with:
{
  "feedback": "Overall testing assessment",
  "suggestions": [
    {
      "file": "filename",
      "line_start": number, 
      "line_end": number,
      "issue": "Testing issue description",
      "suggestion": "What tests to add",
      "severity": "low|medium|high|critical"
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Review this code diff for testing needs:\n\n${diff}`,
      },
    ];

    const response = await generateChatCompletion({ messages });
    try {
      const parsed = JSON.parse(response.content || "{}");
      return {
        type: "testing",
        feedback: parsed.feedback || "Testing coverage looks adequate.",
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      return {
        type: "testing",
        feedback: response.content || "Testing review completed.",
        suggestions: [],
      };
    }
  }

  /**
   * Orchestrator that runs all agents and combines results
   */
  static async comprehensiveReview(diff: string): Promise<AgentReviewResult[]> {
    logger.agent("Starting comprehensive agentic review...");

    const cfg = config.get();
    const reviewPromises: Promise<AgentReviewResult>[] = [];

    // Add enabled agents to the review process
    if (cfg.enableSecurityAgent) {
      reviewPromises.push(this.securityReview(diff));
    }
    if (cfg.enablePerformanceAgent) {
      reviewPromises.push(this.performanceReview(diff));
    }
    if (cfg.enableCodeQualityAgent) {
      reviewPromises.push(this.codeQualityReview(diff));
    }
    if (cfg.enableDocumentationAgent) {
      reviewPromises.push(this.documentationReview(diff));
    }
    if (cfg.enableTestingAgent) {
      reviewPromises.push(this.testingReview(diff));
    }

    try {
      const results = await Promise.all(reviewPromises);
      logger.success(
        `All ${results.length} agent reviews completed successfully`
      );
      return results;
    } catch (error) {
      logger.error("Error in agent reviews:", error);
      // Return partial results or fallback
      return [];
    }
  }
}
