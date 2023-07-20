import ExtendedClient from "../../classes/ExtendedClient";
import Discord from "discord.js";
import { Request, Response } from "express";

import cap from "../../util/cap";
import * as parser from "../util/parser";

import SentryCapture from "../../models/SentryCapture";

export default async (req: Request & any, res: Response, client: ExtendedClient & any) => {
    const data = await SentryCapture.findOne({ _id: req.params.secret });

    if(!data) return res.status(401).json({ "message": "Invalid capture ID.", "code": "INVALID_ID" });

    const event = req.body;

    const embed = new Discord.EmbedBuilder()
        .setColor(parser.getColor(parser.getLevel(event)))
        .setAuthor({ name: event.project_name, iconURL: "https://gc-sentry-api.wdh.gg/assets/sentry-glyph-light-400x367.png", url: `https://${parser.getOrganisation(parser.getLink(event))}.sentry.io/projects/${event.project_slug}` })
        .setTimestamp(parser.getTime(event))

    const projectName = parser.getProject(event);
    const eventTitle = parser.getTitle(event);

    embed.setTitle(cap(eventTitle, 250));

    if(projectName) embed.setTitle(cap(`[${projectName}] ${eventTitle}`, 250));

    const link = parser.getLink(event);

    if(link.startsWith("https://") || link.startsWith("http://")) embed.setURL(parser.getLink(event));

    const fileLocation = parser.getFileLocation(event);
    const snippet = cap(parser.getErrorCodeSnippet(event), 3900);

    if(snippet) {
        embed.setDescription(`${fileLocation ? `📄 \`${fileLocation.slice(-95)}\`\n` : ""}\`\`\`${parser.getLanguage(event) ?? parser.getPlatform(event)}\n${snippet}\`\`\``);
    } else {
        embed.setDescription("Unable to generate code snippet.");
    }

    const fields = [];

    const location = parser.getErrorLocation(event, 7);

    if(location?.length > 0) {
        fields.push({
            name: "Stack",
            value: `\`\`\`${cap(location.join("\n"), 1000)}\n\`\`\``
        })
    }

    const user = parser.getUser(event);

    if(user?.username) {
        fields.push({
            name: "User",
            value: cap(`${user.username} ${user.id ? `(${user.id})` : ""}`, 1024),
            inline: true
        })
    }

    const tags: Array<any> = parser.getTags(event);

    if(Object.keys(tags).length > 0) {
        fields.push({
            name: "Tags",
            value: cap(tags.map(([key, value]) => `**${key}**: ${value}`).join("\n"), 1024),
            inline: true
        })
    }

    const extras = parser.getExtras(event);

    if(extras.length > 0) {
        fields.push({
            name: "Extras",
            value: cap(extras.join("\n"), 1024),
            inline: true
        })
    }

    const contexts = parser.getContexts(event);

    if(contexts.length > 0) {
        fields.push({
            name: "Contexts",
            value: cap(contexts.join("\n"), 1024),
            inline: true
        })
    }

    const release = parser.getRelease(event);

    if(release) {
        fields.push({
            name: "Release",
            value: cap(release, 1024),
            inline: true
        })
    }

    embed.addFields(fields);

    const actions = new Discord.ActionRowBuilder()
        .addComponents (
            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId(`sentry-ignore-${event.id}`)
                .setEmoji("🔕"),

            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId(`sentry-resolve-${event.id}`)
                .setEmoji("✅"),

            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId(`sentry-delete-${event.id}`)
                .setEmoji("🗑️")
        )

    const channel = client.channels.cache.get(data.channel);

    try {
        await channel.send({ embeds: [embed], components: [actions] });
        res.status(200).json({ "success": true });
    } catch(err) {
        client.sentry.captureException(err);
        console.error(err);

        res.status(500).json({ "success": false });
    }
}
