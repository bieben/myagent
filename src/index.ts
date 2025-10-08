import MCPClient from "./MCPClient";
import Agent from "./Agent";
import path from "path";
import EmbeddingRetriever from "./EmbeddingRetriever";
import fs from "fs";
import { logTitle } from "./utils";

const URL = 'https://news.ycombinator.com/'
const outPath = path.join(process.cwd(), 'output');
const TASK = `Tell me information about Antonette. First, find relevant information from the provided context, summarize it, and then create a story about her.
Save the story and her basic information to ${outPath}/antonette.md, and output a beautiful markdown file.`;

const fetchMCP = new MCPClient("mcp-server-fetch", "uvx", ['mcp-server-fetch']);
const fileMCP = new MCPClient("mcp-server-file", "npx", ['-y', '@modelcontextprotocol/server-filesystem', outPath]);

async function main() {
    // RAG
    const context = await retrieveContext();

    // Agent
    const agent = new Agent('gpt-4o-mini', [fetchMCP, fileMCP], '', context);
    await agent.init();
    await agent.invoke(TASK);
    await agent.close();
}

main()

async function retrieveContext() {
    // RAG
    const embeddingRetriever = new EmbeddingRetriever("BAAI/bge-m3");
    const knowledgeDir = path.join(process.cwd(), 'knowledge');
    const files = fs.readdirSync(knowledgeDir);
    for await (const file of files) {
        const content = fs.readFileSync(path.join(knowledgeDir, file), 'utf-8');
        await embeddingRetriever.embedDocument(content);
    }
    const context = (await embeddingRetriever.retrieve(TASK, 3)).join('\n');
    logTitle('CONTEXT');
    console.log(context);
    return context
}