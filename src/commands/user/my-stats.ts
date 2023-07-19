import CustomClient from "../../classes/CustomClient";
import { CommandInteraction } from "discord.js";

import BlockedMessage from "../../models/BlockedMessage";
import Message from "../../models/Message";

export = {
    name: "my-stats",
    description: "Get your Global Chat statistics.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 10,
    enabled: true,
    staffOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: CustomClient, Discord: any) {
        try {
            const messages = await Message.find({ user: interaction.user.id });
            const blockedMessages = await BlockedMessage.find({ user: interaction.user.id });

            const stat_messages = `💬 ${messages.length} Message${messages.length === 1 ? "" : "s"}`;
            const stat_blocked = `⛔ ${blockedMessages.length} Blocked Message${blockedMessages.length === 1 ? "" : "s"}`;

            const statistics = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("📊 Statistics")
                .setDescription(`${stat_messages}\n${stat_blocked}`)

            await interaction.editReply({ embeds: [statistics] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
