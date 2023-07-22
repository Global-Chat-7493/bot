import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { CommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";
import getDomain from "../../util/getDomain";

import WhitelistedDomain from "../../models/WhitelistedDomain";

const command: Command = {
    name: "whitelist-domain",
    description: "[DEVELOPER ONLY] Whitelist a domain.",
    options: [
        {
            type: 3,
            name: "domain",
            description: "The domain to whitelist.",
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: new Roles(["dev"]),
    cooldown: 0,
    enabled: true,
    staffOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const domain = getDomain(interaction.options.get("domain").value);

            const data = await WhitelistedDomain.findOne({ _id: domain });

            if(data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} \`${domain}\` is already whitelisted!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            new WhitelistedDomain({
                _id: domain,
                timestamp: Date.now(),
                whitelisted_by: interaction.user.id
            }).save()

            const whitelisted = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} \`${domain}\` has been whitelisted!`)

            await interaction.editReply({ embeds: [whitelisted] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
