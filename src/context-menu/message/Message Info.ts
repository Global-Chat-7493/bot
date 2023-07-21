import ContextCommand from "../../classes/ContextCommand";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { MessageContextMenuCommandInteraction } from "discord.js";

import { noMessage } from "../../util/embeds";

import Message from "../../models/Message";
import User from "../../models/User";

const command: ContextCommand = {
    name: "Message Info",
    type: 3,
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: new Roles([]),
    cooldown: 3,
    enabled: true,
    staffOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: MessageContextMenuCommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const message = interaction.targetMessage;

            const data = await Message.findOne({ messages: message.url });
            const userData = await User.findOne({ _id: interaction.user.id });

            if(!await Message.exists({ messages: message.url })) return await interaction.editReply({ embeds: [noMessage] });

            if(!userData?.mod && !userData?.dev) {
                const info = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "🕰️ Timestamp", value: `<t:${Number((BigInt(data._id) >> 22n) + 1420070400000n).toString().slice(0, -3)}> (<t:${Number((BigInt(data._id) >> 22n) + 1420070400000n).toString().slice(0, -3)}:R>)` },
                        { name: "👤 User ID", value: `${data.user}` }
                    )

                await interaction.editReply({ embeds: [info] });
                return;
            }

            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .addFields (
                    { name: "🕰️ Timestamp", value: `<t:${Number((BigInt(data._id) >> 22n) + 1420070400000n).toString().slice(0, -3)}> (<t:${Number((BigInt(data._id) >> 22n) + 1420070400000n).toString().slice(0, -3)}:R>)` },
                    { name: "💬 Message ID", value: `${data._id}` },
                    { name: "👤 User ID", value: `${data.user}` },
                    { name: "🗄️ Guild ID", value: `${data.guild}` },
                    { name: "📤 Sent To", value: `${data.messages.length} guild${data.messages.length === 1 ? "" : "s"}` }
                )

            await interaction.editReply({ embeds: [info] });
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}

export = command;
