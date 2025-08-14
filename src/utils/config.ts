import { env } from "../env";

export interface AgentConfig {
  // Review settings
  enableAgenticReview: boolean;
  enableSecurityAgent: boolean;
  enablePerformanceAgent: boolean;
  enableCodeQualityAgent: boolean;
  enableDocumentationAgent: boolean;
  enableTestingAgent: boolean;

  // Processing settings
  maxFilesPerReview: number;
  maxTokensPerRequest: number;
  retryAttempts: number;

  // Model settings
  primaryModel: string;
  fallbackModel?: string;
  temperature: number;

  // GitHub settings
  maxCommentLength: number;
  createIssueLinks: boolean;
}

const DEFAULT_CONFIG: AgentConfig = {
  // Review settings
  enableAgenticReview: true,
  enableSecurityAgent: true,
  enablePerformanceAgent: true,
  enableCodeQualityAgent: true,
  enableDocumentationAgent: true,
  enableTestingAgent: true,

  // Processing settings
  maxFilesPerReview: 20,
  maxTokensPerRequest: 30000, // Conservative limit for Groq
  retryAttempts: 3,

  // Model settings
  primaryModel: "mixtral-8x7b-32768",
  temperature: 0.1,

  // GitHub settings
  maxCommentLength: 8000, // GitHub has a limit around 8192 characters
  createIssueLinks: true,
};

class ConfigManager {
  private config: AgentConfig;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.loadFromEnvironment();
  }

  private loadFromEnvironment() {
    // Load configuration from environment variables
    if (process.env.ENABLE_AGENTIC_REVIEW !== undefined) {
      this.config.enableAgenticReview =
        process.env.ENABLE_AGENTIC_REVIEW === "true";
    }

    if (process.env.MAX_FILES_PER_REVIEW) {
      this.config.maxFilesPerReview = parseInt(
        process.env.MAX_FILES_PER_REVIEW,
        10
      );
    }

    if (process.env.MAX_TOKENS_PER_REQUEST) {
      this.config.maxTokensPerRequest = parseInt(
        process.env.MAX_TOKENS_PER_REQUEST,
        10
      );
    }

    if (process.env.RETRY_ATTEMPTS) {
      this.config.retryAttempts = parseInt(process.env.RETRY_ATTEMPTS, 10);
    }

    if (process.env.PRIMARY_MODEL) {
      this.config.primaryModel = process.env.PRIMARY_MODEL;
    }

    if (process.env.TEMPERATURE) {
      this.config.temperature = parseFloat(process.env.TEMPERATURE);
    }

    // Agent-specific toggles
    if (process.env.ENABLE_SECURITY_AGENT !== undefined) {
      this.config.enableSecurityAgent =
        process.env.ENABLE_SECURITY_AGENT === "true";
    }

    if (process.env.ENABLE_PERFORMANCE_AGENT !== undefined) {
      this.config.enablePerformanceAgent =
        process.env.ENABLE_PERFORMANCE_AGENT === "true";
    }

    if (process.env.ENABLE_CODE_QUALITY_AGENT !== undefined) {
      this.config.enableCodeQualityAgent =
        process.env.ENABLE_CODE_QUALITY_AGENT === "true";
    }

    if (process.env.ENABLE_DOCUMENTATION_AGENT !== undefined) {
      this.config.enableDocumentationAgent =
        process.env.ENABLE_DOCUMENTATION_AGENT === "true";
    }

    if (process.env.ENABLE_TESTING_AGENT !== undefined) {
      this.config.enableTestingAgent =
        process.env.ENABLE_TESTING_AGENT === "true";
    }
  }

  get(): AgentConfig {
    return { ...this.config };
  }

  update(updates: Partial<AgentConfig>) {
    this.config = { ...this.config, ...updates };
  }

  reset() {
    this.config = { ...DEFAULT_CONFIG };
    this.loadFromEnvironment();
  }
}

export const config = new ConfigManager();
