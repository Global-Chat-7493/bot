const emoji = require("../../config.json").emojis;

const bannedUserSchema = require("../../models/bannedUserSchema");
const devSchema = require("../../models/devSchema");
const modSchema = require("../../models/modSchema");
const verifiedSchema = require("../../models/verifiedSchema");

module.exports = {
    name: "ban",
    description: "[MODERATOR ONLY] Ban a user.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user you want to ban.",
            required: true
        },

        {
            type: 3,
            name: "reason",
            description: "Why you want to ban the user.",
            max_length: 250,
            required: true
        },

        {
            type: 5,
            name: "appealable",
            description: "Do you want this user to be able to appeal?",
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 0,
    enabled: true,
    hidden: true,
	async execute(interaction, client, Discord) {
        try {
            const dev = await devSchema.exists({ _id: interaction.user.id });
            const mod = await modSchema.exists({ _id: interaction.user.id });
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            if(!mod && !dev) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const user = interaction.options.getUser("user");
            const reason = interaction.options.getString("reason");
            const appealable = interaction.options.getBoolean("appealable");

            if(user.id === interaction.user.id) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You cannot ban yourself!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            if(user.bot) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You cannot ban bots!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            if(user.id === client.config_default.owner) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You cannot ban that user!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            if(await bannedUserSchema.exists({ _id: user.id })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} ${user} is already banned!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            new bannedUserSchema({
                _id: user.id,
                timestamp: Date.now(),
                allowAppeal: appealable,
                reason: reason,
                mod: interaction.user.id
            }).save()

            await devSchema.findOneAndDelete({ _id: user.id });
            await modSchema.findOneAndDelete({ _id: user.id });
            await verifiedSchema.findOneAndDelete({ _id: user.id });

            const ban = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setTitle("Banned")
                .setDescription("ℹ️ You have been banned from using Global Chat.")
                .addFields (
                    { name: "❓ Reason", value: `${reason}` },
                    { name: "📜 Appealable", value: appealable ? "✅" : "❌" }
                )
                .setTimestamp()

            if(appealable) {
                ban.addFields (
                    { name: "ℹ️ How to Appeal", value: "1. Join the [support server](https://discord.gg/globalchat).\n2. Go to the [appeal channel](https://discord.com/channels/1067023529226293248/1094505532267704331).\n3. Click \`Submit\` and fill in the form.\n4. Wait for a response to your appeal." }
                )
            }

            let sentDM = false;

            try {
                await user.send({ embeds: [ban] });
                sentDM = true;
            } catch {}

            const banned = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.successful} ${user} has been banned.`)

            await interaction.editReply({ embeds: [banned] });

            const banLog = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                .setTitle("User Banned")
                .addFields (
                    { name: "👤 User", value: `${user}` },
                    { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                    { name: "❓ Reason", value: `${reason}` },
                    { name: "📜 Appealable", value: appealable ? "✅" : "❌" }
                )
                .setTimestamp()

            modLogsChannel.send({ embeds: [banLog] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
