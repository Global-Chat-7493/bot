import ExtendedClient from "../../classes/ExtendedClient";
import { Message } from "discord.js";

import emojis from "./tests/emojis";
import links from "./tests/links";
import markdown from "./tests/markdown";
import phishing from "./tests/phishing";
import profanity from "./tests/profanity";

export default async function (message: Message, client: ExtendedClient, Discord: any): Promise<boolean> {
    if(!message.content.length) return false;

    // Phishing
    if(await phishing(message, client, Discord)) return true;

    // Profanity
    if(await profanity(message, client, Discord)) return true;

    // Links
    if(await links(message, client, Discord)) return true;

    // Emojis
    if(await emojis(message, client, Discord)) return true;

    // Markdown
    if(await markdown(message, client, Discord)) return true;

    return false;
}
