module.exports = async function(message, client, Discord) {
    const emoji = require("../../../config.json").emojis;

    const bannedUserSchema = require("../../../models/bannedUserSchema");
    const blockedSchema = require("../../../models/blockedSchema");
    const devSchema = require("../../../models/devSchema");
    const modSchema = require("../../../models/modSchema");
    const verifiedSchema = require("../../../models/verifiedSchema");

    const blockedChannel = client.channels.cache.get(client.config_channels.blocked);
    const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

    const profanityFilter = require("../filters/profranity");
    const profanityResult = await profanityFilter(message);

    if(profanityResult.result) {
        new blockedSchema({
            _id: message.id,
            user: message.author.id,
            guild: message.guild.id,
            filter: "PROFANITY",
            reason: profanityResult.words
        }).save()

        if(profanityResult.autoban) {
            new bannedUserSchema({
                _id: message.author.id,
                timestamp: Date.now(),
                allowAppeal: true,
                reason: "[AUTOMOD] Profanity which is included on the autoban filter detected.",
                mod: client.user.id
            }).save()

            await devSchema.findOneAndDelete({ _id: message.author.id });
            await modSchema.findOneAndDelete({ _id: message.author.id });
            await verifiedSchema.findOneAndDelete({ _id: message.author.id });

            const blocked = new Discord.EmbedBuilder()
                .setTitle("⚠️ Profanity Detected")
                .setDescription("You aren't allowed to send messages with profanity!")
                .addFields (
                    { name: "💬 Message", value: `${message.content}` },
                    { name: "🚩 Filter", value: "🤬 Profanity" },
                    { name: "❓ Reason", value: `Word: \`${profanityResult.words.join("\`\nWord: \`")}\`` },
                    { name: "⚒️ Action", value: "🔨 Ban" }
                )

            const ban = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setTitle("🔨 Banned")
                .setDescription(`${emoji.information} You have been banned from using Global Chat.`)
                .addFields (
                    { name: "❓ Reason", value: "[AUTOMOD] Profanity which is included on the autoban filter detected." },
                    { name: "📜 Appealable", value: "✅" },
                    { name: "ℹ️ How to Appeal", value: "1. Join the [support server](https://discord.gg/globalchat).\n2. Go to the [appeal channel](https://discord.com/channels/1067023529226293248/1094505532267704331).\n3. Click \`Submit\` and fill in the form.\n4. Wait for a response to your appeal." }
                )
                .setTimestamp()

            if(message.attachments.first()) {
                const fileExt = path.extname(message.attachments.first().url.toLowerCase());
                const allowedExtensions = ["jpeg", "jpg", "png", "svg", "webp"];

                if(allowedExtensions.includes(fileExt.split(".").join(""))) {
                    const attachment = await new Discord.MessageAttachment(attachment.url).fetch();

                    blocked.setImage(`attachment://${attachment.name}`);
                }
            }

            let sentDM = false;

            try {
                await message.author.send({ embeds: [blocked] });
                await message.author.send({ embeds: [ban] });
                sentDM = true;
            } catch {}

            blocked.setAuthor({ name: message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` });
            blocked.setDescription(null);

            const blockedInfo = new Discord.EmbedBuilder()
                .addFields (
                    { name: "User ID", value: `${message.author.id}` },
                    { name: "Guild ID", value: `${message.guild.id}` }
                )

            blockedChannel.send({ embeds: [blocked, blockedInfo] });

            const banLog = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: client.user.tag.endsWith("#0") ? `@${client.user.username}` : client.user.tag, iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${client.user.id}` })
                .setTitle("User Banned")
                .addFields (
                    { name: "👤 User", value: `${message.author}` },
                    { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                    { name: "❓ Reason", value: "[AUTOMOD] Profanity which is included on the autoban filter detected." },
                    { name: "📜 Appealable", value: "✅" }
                )
                .setTimestamp()

            modLogsChannel.send({ embeds: [banLog] });
        } else {
            const blocked = new Discord.EmbedBuilder()
                .setTitle("⚠️ Profanity Detected")
                .setDescription("You aren't allowed to send messages with profanity!")
                .addFields (
                    { name: "💬 Message", value: `${message.content}` },
                    { name: "🚩 Filter", value: "🤬 Profanity" },
                    { name: "❓ Reason", value: `Word: \`${profanityResult.words.join("\`\nWord: \`")}\`` },
                )

            if(message.attachments.first()) {
                const fileExt = path.extname(message.attachments.first().url.toLowerCase());
                const allowedExtensions = ["jpeg", "jpg", "png", "svg", "webp"];

                if(allowedExtensions.includes(fileExt.split(".").join(""))) {
                    const attachment = await new Discord.MessageAttachment(attachment.url).fetch();

                    blocked.setImage(`attachment://${attachment.name}`);
                }
            }

            try {
                await message.author.send({ embeds: [blocked] });
            } catch {}

            blocked.setAuthor({ name: message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` });
            blocked.setDescription(null);

            const blockedInfo = new Discord.EmbedBuilder()
                .addFields (
                    { name: "User ID", value: `${message.author.id}` },
                    { name: "Guild ID", value: `${message.guild.id}` }
                )

            blockedChannel.send({ embeds: [blocked, blockedInfo] });
        }

        return true;
    }

	return false;
}
