import { Tool } from "@modelcontextprotocol/sdk/types.js";
import OpenAI from "openai";
import "dotenv/config";
import { logTitle } from "./utils";
import { ProxyAgent, setGlobalDispatcher } from "undici";

setGlobalDispatcher(
  new ProxyAgent(process.env.HTTPS_PROXY || "http://127.0.0.1:7890")
);

export interface ToolCall {
    id: string
    function: {
        name: string
        arguments: string
    }
}

/**
 * ChatOpenAI class provides a wrapper around OpenAI's API with streaming support
 * and Model Context Protocol (MCP) tool integration
 */
export default class ChatOpenAI {
    private llm: OpenAI                                        // OpenAI client instance
    private model: string                                      // AI model name (e.g., "gpt-4o-mini")
    private messages: OpenAI.ChatCompletionMessageParam[] = [] // Conversation history
    private tools: Tool[]                                      // Available MCP tools

    /**
     * Initialize ChatOpenAI instance
     * @param model - AI model name (required)
     * @param systemPrompt - Initial system prompt (optional)
     * @param tools - Array of MCP tools (optional)
     * @param context - Initial context/user message (optional)
     */
    constructor(model: string, systemPrompt: string = "", tools: Tool[] = [], context: string = "") {
        // Initialize OpenAI client with API credentials from environment
        this.llm = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_API_BASE_URL,
        });
        this.model = model
        this.tools = tools
        
        // Add system prompt to conversation if provided
        if (systemPrompt) this.messages.push({
            role: "system",
            content: systemPrompt,
        })
        
        // Add initial context as user message if provided
        if (context) this.messages.push({
            role: "user",
            content: context,
        })
    }

    /**
     * Send a chat message and get streaming response with tool call support
     * @param prompt - Optional user message to send
     * @returns Promise containing response content and any tool calls
     */
    async chat(prompt?: string) {
        logTitle("CHAT")
        
        // Add user prompt to conversation history if provided
        if (prompt) this.messages.push({
            role: "user",
            content: prompt,
        })
        
        // Create streaming completion request with tool support
        const stream = await this.llm.chat.completions.create({
            model: this.model,
            messages: this.messages,
            tools: this.getToolsDefinition(), // Convert MCP tools to OpenAI format
            stream: true,                     // Enable streaming for real-time response
        })

        // Initialize variables to accumulate streaming data
        let content = ""                    // Accumulated response content
        let toolCalls: ToolCall[] = []      // Accumulated tool calls
        logTitle("RESPONSE")
        
        // Process each chunk from the stream
        for await (const chunk of stream) {
            const delta = chunk.choices[0].delta
            
            // Handle text content chunks
            if (delta.content) {
                const contentChunk = delta.content || ""
                content += contentChunk
                process.stdout.write(contentChunk) // Display content in real-time
            }
            
            // Handle tool call chunks (streamed incrementally)
            if (delta.tool_calls) {
                for (const toolCallChunk of delta.tool_calls) {
                    // Ensure we have enough tool call slots
                    if (toolCalls.length <= toolCallChunk.index) {
                        toolCalls.push({id: "", function: {name: "", arguments: "",}})
                    }
                    
                    // Accumulate tool call data by index
                    let currentCall = toolCalls[toolCallChunk.index]
                    if (toolCallChunk.id) currentCall.id += toolCallChunk.id
                    if (toolCallChunk.function?.name) currentCall.function.name += toolCallChunk.function.name
                    if (toolCallChunk.function?.arguments) currentCall.function.arguments += toolCallChunk.function.arguments
                }
            }
        }
        
        // Add the complete assistant response to conversation history
        this.messages.push({
            role: "assistant",
            content,
            tool_calls: toolCalls.map((call) => ({
                id: call.id,
                type: "function" as const,
                function: call.function,
            })),
        })
        
        return { content, toolCalls }
    }

    /**
     * Append tool execution result to conversation history
     * This method should be called after executing a tool to provide the result back to the AI
     * @param toolCallId - ID of the tool call (from ToolCall.id)
     * @param toolOutput - Result/output from the tool execution
     */
    public appendToolResult(toolCallId: string, toolOutput: string) {
        this.messages.push({
            role: "tool",
            content: toolOutput,
            tool_call_id: toolCallId,
        })
    }

    /**
     * Convert MCP tool definitions to OpenAI API format
     * @returns Array of tool definitions in OpenAI's expected format
     */
    private getToolsDefinition() {
        return this.tools.map((tool) => ({
            type: "function" as const, // Literal type required by OpenAI API
            function: tool,           // MCP tool definition
        }))
    }
}