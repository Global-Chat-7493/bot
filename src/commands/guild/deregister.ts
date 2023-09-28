import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction, PermissionFlagsBits } from "discord.js";

import { emojis as emoji } from "../../config";

import Guild from "../../models/Guild";

const command: Command = {
    name: "deregister",
    description: "Remove the global chat channel.",
    options: [],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    botPermissions: [],
    requiredRoles: [],
    cooldown: 60,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: false,
    deferReply: true,
    ephemeral: false,
    async execute(interaction: CommandInteraction, client: ExtendedClient & any, Discord: typeof import("discord.js")) {
        try {
            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            await Guild.findOneAndDelete({ _id: interaction.guild.id });

            const deregistered = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} The global chat channel has been deregistered.`)

            await interaction.editReply({ embeds: [deregistered] });

            const log = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("❌ Guild Deregistered")
                .addFields (
                    { name: "Name", value: interaction.guild.name, inline: true },
                    { name: "ID", value: interaction.guild.id.toString(), inline: true },
                    { name: "Responsible User", value: `${interaction.user}`, inline: true }
                )
                .setTimestamp()

            logsChannel.send({ embeds: [log] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
