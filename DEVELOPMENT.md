# CodeScribe Agent - Development Setup

## Development Mode (No NGROK Required!)

For local development, you can use **Smee.io** instead of NGROK. This is much simpler and doesn't require installing additional software.

### Quick Setup Steps:

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Get your Groq API key** from [https://console.groq.com/keys](https://console.groq.com/keys)

3. **Create a Smee channel** by visiting [https://smee.io/](https://smee.io/) and clicking "Start a new channel"

4. **Create a GitHub App:**

   - Go to [https://github.com/settings/apps](https://github.com/settings/apps)
   - Click "New GitHub App"
   - **Webhook URL**: Use your Smee.io URL (e.g., `https://smee.io/abc123`)
   - **Webhook Secret**: Create any random string
   - **Permissions**: Grant read & write for:
     - Pull Requests
     - Repository Contents
     - Issues
     - Commit Statuses
   - **Events**: Subscribe to:
     - Pull Request
     - Pull Request Review
     - Pull Request Review Comment

5. **Create your `.env` file:**

   ```env
   GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
   <your-github-private-key>
   -----END RSA PRIVATE KEY-----"
   GITHUB_APP_ID=<your-app-id>
   GITHUB_WEBHOOK_SECRET=<your-webhook-secret>
   GROQ_API_KEY=<your-groq-api-key>

   # Development settings
   NODE_ENV=development
   LOG_LEVEL=DEBUG

   # Agent configuration (optional)
   ENABLE_AGENTIC_REVIEW=true
   ENABLE_SECURITY_AGENT=true
   ENABLE_PERFORMANCE_AGENT=true
   ENABLE_CODE_QUALITY_AGENT=true
   ENABLE_DOCUMENTATION_AGENT=true
   ENABLE_TESTING_AGENT=true
   ```

6. **Start the development server:**

   ```bash
   npm run dev
   ```

7. **Start Smee client** (in another terminal):
   ```bash
   npx smee -u <your-smee-url> -p 3000
   ```

That's it! Now when you create pull requests in repositories where your GitHub App is installed, the agent will automatically review them.

## Alternative: Traditional NGROK Setup

If you prefer NGROK:

1. Download NGROK from [https://ngrok.com/download](https://ngrok.com/download)
2. Run: `ngrok http 3000`
3. Use the NGROK URL + `/api/review` as your webhook URL
4. Run: `npm start`

## Configuration Options

You can customize the agent behavior using environment variables:

- `ENABLE_AGENTIC_REVIEW=true/false` - Enable/disable the new multi-agent review system
- `ENABLE_SECURITY_AGENT=true/false` - Enable/disable security-focused reviews
- `ENABLE_PERFORMANCE_AGENT=true/false` - Enable/disable performance reviews
- `ENABLE_CODE_QUALITY_AGENT=true/false` - Enable/disable code quality reviews
- `ENABLE_DOCUMENTATION_AGENT=true/false` - Enable/disable documentation reviews
- `ENABLE_TESTING_AGENT=true/false` - Enable/disable testing reviews
- `LOG_LEVEL=DEBUG/INFO/WARN/ERROR` - Set logging level
- `MAX_FILES_PER_REVIEW=20` - Maximum files to review in one PR
- `TEMPERATURE=0.1` - LLM temperature for responses

## Testing

Create a test pull request in a repository where your GitHub App is installed. The agent will:

1. 🔍 Analyze all changed files
2. 🚀 Run multiple specialized AI agents (security, performance, code quality, documentation, testing)
3. 📝 Generate a comprehensive review with specific suggestions
4. 💬 Post the review as a GitHub comment

## Features Added

### ✨ Multi-Agent Review System

- **Security Agent**: Identifies vulnerabilities, injection attacks, auth issues
- **Performance Agent**: Finds bottlenecks, inefficient algorithms, memory issues
- **Code Quality Agent**: Reviews readability, naming, SOLID principles
- **Documentation Agent**: Suggests missing docs, comments, examples
- **Testing Agent**: Identifies missing tests, edge cases

### 🐍 Python Parser Support

- Complete Python code analysis
- Function and class detection
- Basic syntax validation
- Indentation checking

### 🛠️ Enhanced Infrastructure

- Improved error handling with retries
- Configurable logging system
- Environment-based configuration
- Better fallback mechanisms

The agent is now much more robust and provides detailed, actionable feedback!
