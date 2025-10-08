import MCPClient from "./MCPClient"
import Agent from "./Agent"

const currentDir = process.cwd()

const fetchMcp = new MCPClient('fetch', 'uvx', ['mcp-server-fetch'],)
const fileMcp = new MCPClient('file', 'npx', ["-y", "@modelcontextprotocol/server-filesystem", currentDir])

async function main(){
    const agent = new Agent("gpt-4o-mini", [fetchMcp, fileMcp])
    await agent.init()
    const response = await agent.invoke(`script the content of https://news.ycombinator.com/, and do a summary. Save the summary to a file named news.md in ${currentDir}.`)
    console.log(response)
}

main()