import chalk from "chalk";

export function logTitle(message: string) {
    const totalLength = 80;
    const messageLength = message.length;
    const paddingLength = Math.max(0, (totalLength - messageLength - 2));
    const paddingMessage = `${"=".repeat(Math.floor(paddingLength) / 2)} ${message} ${"=".repeat(Math.ceil(paddingLength) / 2)}`;
    console.log(chalk.bold.cyanBright(paddingMessage));
}