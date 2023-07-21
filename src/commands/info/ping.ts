import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { CommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";

const command: Command = {
    name: "ping",
    description: "Check the bot's latency.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: new Roles([]),
    cooldown: 10,
    enabled: true,
    staffOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const pinging = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.ping} Pinging...`)

            const i = await interaction.editReply({ embeds: [pinging] });

            const botLatency = i.createdTimestamp - interaction.createdTimestamp;
            const apiLatency = Math.round(client.ws.ping);

            let botLatencyValue;
            let apiLatencyValue;

            if(botLatency >= 0 && botLatency <= 99) {
                botLatencyValue = `🟢 ${botLatency}ms`;
            } else if(botLatency >= 100 && botLatency <= 199) {
                botLatencyValue = `🟠 ${botLatency}ms`;
            } else {
                botLatencyValue = `🔴 ${botLatency}ms`;
            }

            if(apiLatency >= 0 && apiLatency <= 99) {
                apiLatencyValue = `🟢 ${apiLatency}ms`;
            } else if(apiLatency >= 100 && apiLatency <= 199) {
                apiLatencyValue = `🟠 ${apiLatency}ms`;
            } else {
                apiLatencyValue = `🔴 ${apiLatency}ms`;
            }

            const ping = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("🏓 Pong!")
                .addFields (
                    { name: "Bot Latency", value: botLatencyValue, inline: true },
                    { name: "API Latency", value: apiLatencyValue, inline: true }
                )

            await interaction.editReply({ embeds: [ping] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
