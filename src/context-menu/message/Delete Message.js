const emoji = require("../../config.json").emojis;

const devSchema = require("../../models/devSchema");
const messageSchema = require("../../models/messageSchema");
const modSchema = require("../../models/modSchema");

module.exports = {
	name: "Delete Message",
    type: 3,
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    hidden: false,
	async execute(interaction, client, Discord) {
        try {
            const message = interaction.targetMessage;
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            if(!await messageSchema.exists({ messages: message.url })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} No message was found with that ID!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const data = await messageSchema.findOne({ messages: message.url });

            const dev = await devSchema.exists({ _id: interaction.user.id });
            const mod = await modSchema.exists({ _id: interaction.user.id });

            if(!mod && !dev && data.user !== interaction.user.id) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            const total = data.messages.length;
            let deleted = 0;

            const promises = [];

            for(const message of data.messages) {
                promises.push(new Promise(async resolve => {
                    const info = message.replace("https://discord.com/channels/", "").split("/");

                    try {
                        await client.channels.fetch(info[1]).then(async channel => {
                            await channel.messages.delete(info[2]);
                        })

                        deleted += 1;
                        resolve(true);
                    } catch {
                        resolve(false);
                    }
                }))
            }

            Promise.all(promises).then(async () => {
                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.successful} The message has been deleted!`)

                await interaction.editReply({ embeds: [result], ephemeral: true });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle(`🗑️ Message Deleted`)
                    .addFields (
                        { name: "💬 Message", value: `${data._id}` },
                        { name: "📄 Result", value: `Deleted ${deleted} of ${total} messages.` }
                    )
                    .setTimestamp()

                modLogsChannel.send({ embeds: [log] });
            })
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}
