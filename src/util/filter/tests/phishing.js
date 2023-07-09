module.exports = async function(message, client, Discord) {
    const BannedUser = require("../../../models/BannedUser");
    const BlockedMessage = require("../../../models/BlockedMessage");

    const blockedChannel = client.channels.cache.get(client.config_channels.blocked);
    const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

    const phishingFilter = require("../filters/phishing");
    const phishingResult = await phishingFilter(message);

    if(phishingResult) {
        new BlockedMessage({
            _id: message.id,
            user: message.author.id,
            guild: message.guild.id,
            filter: "PHISHING",
            reason: "Phishing link detected."
        }).save()

        new BannedUser({
            _id: message.author.id,
            timestamp: Date.now(),
            allowAppeal: true,
            reason: "[AUTOMOD] Phishing link detected.",
            mod: client.user.id
        }).save()

        const blocked = new Discord.EmbedBuilder()
            .setTitle("⛔ Message Blocked")
            .setDescription(message.content)
            .addFields (
                { name: "🚩 Filter", value: "🪝 Phishing" },
                { name: "❓ Reason", value: "Phishing link detected." }
            )

        let attachment = null;

        if(message.attachments.first()) {
            const fileExt = path.extname(message.attachments.first().url.toLowerCase());
            const allowedExtensions = ["gif", "jpeg", "jpg", "png", "svg", "webp"];

            if(allowedExtensions.includes(fileExt.split(".").join(""))) {
                attachment = new Discord.AttachmentBuilder(message.attachments.first().url, { name: `attachment${fileExt}` });

                blocked.setImage(`attachment://${attachment.name}`);
            }
        }

        const ban = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setTitle("Banned")
            .setDescription("ℹ️ You have been banned from using Global Chat.")
            .addFields (
                { name: "❓ Reason", value: "[AUTOMOD] Phishing link detected." },
                { name: "📜 Appealable", value: "✅" },
                { name: "ℹ️ How to Appeal", value: "1. Join the [support server](https://discord.gg/globalchat).\n2. Go to the [appeal channel](https://discord.com/channels/1067023529226293248/1094505532267704331).\n3. Click \`Submit\` and fill in the form.\n4. Wait for a response to your appeal." }
            )
            .setTimestamp()

        let sentDM = false;

        try {
            await message.author.send({ embeds: [blocked], files: attachment ? [attachment] : [] });
            await message.author.send({ embeds: [ban] });
            sentDM = true;
        } catch {}

        blocked.setAuthor({ name: message.author.tag.endsWith("#0") ? message.author.username : message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` });
        blocked.addFields (
            { name: "⚒️ Action", value: "🔨 Ban" }
        )

        const actions = new Discord.ActionRowBuilder()
            .addComponents (
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId(`blocked-message-info-${message.id}`)
                    .setEmoji("ℹ️")
            )

        blockedChannel.send({ embeds: [blocked], components: [actions], files: attachment ? [attachment] : [] });

        const banLog = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.default)
            .setAuthor({ name: client.user.tag.endsWith("#0") ? client.user.username : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
            .setTitle("User Banned")
            .addFields (
                { name: "👤 User", value: `${message.author}` },
                { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                { name: "❓ Reason", value: "[AUTOMOD] Phishing link detected." },
                { name: "📜 Appealable", value: "✅" }
            )
            .setTimestamp()

        modLogsChannel.send({ embeds: [banLog] });
        return true;
    }

	return false;
}
