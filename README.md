# MyAgent - AI Agent Framework with RAG and MCP Integration

A sophisticated AI agent framework built with TypeScript that combines Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), and Model Context Protocol (MCP) for enhanced AI capabilities.

## 🚀 Features

- **🤖 AI Agent**: Autonomous agent with tool-calling capabilities
- **🔍 RAG System**: Retrieval-Augmented Generation with embedding-based search
- **🛠️ MCP Integration**: Model Context Protocol for external tool integration
- **📊 Vector Store**: In-memory vector database with cosine similarity search
- **🌊 Streaming Support**: Real-time streaming responses from OpenAI
- **🔧 Multiple Tools**: File system operations, web fetching, and more
- **🎯 TypeScript**: Full type safety and modern development experience

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│      Agent      │───▶│    ChatOpenAI    │───▶│   OpenAI API    │
│  (Coordinator)  │    │  (LLM Interface) │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐
│    MCPClient    │───▶│   Tool Servers   │
│ (Tool Interface)│    │  (File, Web...)  │
└─────────────────┘    └──────────────────┘
         │
         ▼
┌──────────────────┐    ┌──────────────────┐
│EmbeddingRetriever│───▶│   Vector Store   │
│   (RAG System)   │    │   (Similarity)   │
└──────────────────┘    └──────────────────┘
```

## 📁 Project Structure

```
src/
├── Agent.ts              # Main agent coordinator
├── ChatOpenAI.ts         # OpenAI API wrapper with streaming
├── MCPClient.ts          # Model Context Protocol client
├── EmbeddingRetriever.ts # RAG embedding and retrieval
├── VectorStore.ts        # In-memory vector database
├── utils.ts              # Utility functions
└── index.ts              # Example implementation
```

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd myagent

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

## ⚙️ Configuration

Create a `.env` file with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_BASE_URL=https://api.openai.com/v1

# Embedding Service Configuration
EMBEDDING_BASE_URL=your_embedding_service_url
EMBEDDING_KEY=your_embedding_api_key

# Proxy Configuration (optional)
HTTPS_PROXY=http://127.0.0.1:7890
```

## 🚀 Quick Start

### Basic Agent Usage

```typescript
import Agent from "./Agent";
import MCPClient from "./MCPClient";

// Create MCP clients for different tools
const fileMCP = new MCPClient("file-server", "npx", ['-y', '@modelcontextprotocol/server-filesystem', './workspace']);
const fetchMCP = new MCPClient("fetch-server", "uvx", ['mcp-server-fetch']);

// Initialize agent
const agent = new Agent('gpt-4o-mini', [fileMCP, fetchMCP]);
await agent.init();

// Use the agent
const response = await agent.invoke("Please read the README.md file and summarize it");
console.log(response);

// Clean up
await agent.close();
```

### RAG System Usage

```typescript
import EmbeddingRetriever from "./EmbeddingRetriever";

// Initialize retriever
const retriever = new EmbeddingRetriever("BAAI/bge-m3");

// Add documents
await retriever.embedDocument("Your document content here");

// Retrieve relevant content
const results = await retriever.retrieve("Your query", 3);
console.log(results);
```

### Streaming Chat

```typescript
import ChatOpenAI from "./ChatOpenAI";

const llm = new ChatOpenAI("gpt-4o-mini", "You are a helpful assistant");
const { content, toolCalls } = await llm.chat("Hello, how are you?");
console.log(content); // Streams in real-time
```

## 🧩 Core Components

### Agent Class
The main coordinator that orchestrates interactions between LLMs and tools.

**Key Features:**
- Autonomous tool calling
- Multi-round conversations
- Automatic tool result handling
- Resource management

### ChatOpenAI Class
OpenAI API wrapper with streaming support and tool integration.

**Key Features:**
- Real-time streaming responses
- Tool call processing
- Conversation history management
- Proxy support for restricted networks

### MCPClient Class
Model Context Protocol client for external tool integration.

**Key Features:**
- Stdio transport for tool servers
- Dynamic tool discovery
- Tool execution management
- Connection lifecycle handling

### EmbeddingRetriever Class
RAG system with embedding-based document retrieval.

**Key Features:**
- Document embedding
- Similarity search
- Top-k retrieval
- Multiple embedding model support

### VectorStore Class
In-memory vector database with similarity search.

**Key Features:**
- Cosine similarity calculation
- Efficient vector storage
- Top-k search results
- Simple API interface

## 📝 Scripts

```bash
# Development
pnpm dev          # Run in development mode

# Production
pnpm build        # Compile TypeScript
pnpm start        # Run compiled JavaScript

# Example Usage
pnpm dev          # Runs the example in src/index.ts
```

## 🔧 Available MCP Servers

The project supports various MCP servers for different functionalities:

- **File System**: `@modelcontextprotocol/server-filesystem`
- **Web Fetching**: `mcp-server-fetch`
- **Database**: Various database connectors
- **Custom Tools**: Easy to integrate custom MCP servers

## 🌟 Example Use Cases

1. **Document Analysis**: RAG-powered document Q&A system
2. **Web Research**: Autonomous web scraping and analysis
3. **File Management**: AI-powered file operations
4. **Content Generation**: Context-aware content creation
5. **Data Processing**: Automated data analysis workflows

## 🔒 Security Notes

- API keys are loaded from environment variables
- Proxy support for restricted network environments
- Tool execution is sandboxed through MCP protocol
- No sensitive data is logged

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for the GPT models
- [Model Context Protocol](https://modelcontextprotocol.io/) for tool integration
- [TypeScript](https://www.typescriptlang.org/) for type safety
- Various MCP server implementations