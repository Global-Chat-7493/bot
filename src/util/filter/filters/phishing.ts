import { Message } from "discord.js";

import filter from "stop-discord-phishing";

export default async function (message: Message): Promise<boolean> {
    return filter.checkMessage(message.content, true);
}
