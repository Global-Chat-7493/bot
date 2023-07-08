const emoji = require("../../config.json").emojis;

module.exports = {
	name: "suggest",
	description: "Suggest an idea for the bot or support server.",
    options: [
    	{
            type: 3,
            name: "text",
            description: "Your suggestion about the bot or support server.",
            max_length: 250,
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 60,
    enabled: true,
    hidden: false,
    deferReply: true,
    ephemeral: true,
	async execute(interaction, client, Discord) {
        try {
        	const text = interaction.options.getString("text");
            const suggestionsChannel = client.channels.cache.get(client.config_channels.suggestions);

            try {
                const suggestion = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                	.setDescription(`${text}`)
                	.setTimestamp()

                const actions = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Success)
                        .setCustomId("suggestion-approve")
                        .setLabel("Approve"),

                        new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Danger)
                        .setCustomId("suggestion-deny")
                        .setLabel("Deny")
                    )

                const message = await suggestionsChannel.send({ embeds: [suggestion], components: [actions] })

                message.react(`${emoji.tick}`);
                message.react(`${emoji.cross}`);
            } catch(err) {
                client.logError(err);

                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} An error occurred while submitting the suggestion.`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const submitted = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} Your suggestion has been sent.`)

            await interaction.editReply({ embeds: [submitted] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}