import ChatOpenAI from "./ChatOpenAI";
import MCPClient from "./MCPClient";
import { logTitle } from "./utils";

export default class Agent {
    private mcpClients: MCPClient[]
    private llm: ChatOpenAI | null = null
    private model: string
    private systemPrompt: string
    private context: string

    constructor(model: string, mcpClients: MCPClient[] = [], systemPrompt: string = "", context: string = "") {
        this.model = model
        this.systemPrompt = systemPrompt
        this.context = context
        this.mcpClients = mcpClients
    }

    public async init() {
        logTitle("INIT LLM AND TOOLS")
        for (const client of this.mcpClients) {
            await client.init()
        }
        const tools = this.mcpClients.flatMap(client => client.getTools())
        this.llm = new ChatOpenAI(this.model, this.systemPrompt, tools, this.context)
    }

    public async close() {
        logTitle("CLOSE MCP CLIENTS")
        for (const client of this.mcpClients) {
            await client.close()
        }
    }

    async invoke(prompt: string) {
        if (!this.llm) throw new Error('Agent not initialized');
        let response = await this.llm.chat(prompt);
        while (true) {
            if (response.toolCalls.length > 0) {
                for (const toolCall of response.toolCalls) {
                    const mcp = this.mcpClients.find(client => client.getTools().some((t: any) => t.name === toolCall.function.name));
                    if (mcp) {
                        logTitle(`TOOL USE`);
                        console.log(`Calling tool: ${toolCall.function.name}`);
                        console.log(`Arguments: ${toolCall.function.arguments}`);
                        const result = await mcp.callTool(toolCall.function.name, JSON.parse(toolCall.function.arguments));
                        console.log(`Result: ${JSON.stringify(result)}`);
                        this.llm.appendToolResult(toolCall.id, JSON.stringify(result));
                    } else {
                        this.llm.appendToolResult(toolCall.id, 'Tool not found');
                    }
                }
                // Continue the chat after tool calls
                response = await this.llm.chat();
                continue
            }
            // No tool calls, end the conversation
            await this.close();
            return response.content;
        }
    }
}