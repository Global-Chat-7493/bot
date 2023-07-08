const emoji = require("../../config.json").emojis;

const appealSchema = require("../../models/appealSchema");

module.exports = {
	name: "appeals",
	description: "[MODERATOR ONLY] Get all appeals related to a user.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user who's appeals to get.",
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["mod"],
    cooldown: 10,
    enabled: true,
    hidden: true,
    deferReply: true,
    ephemeral: false,
	async execute(interaction, client, Discord) {
        try {
            const user = interaction.options.getUser("user");

            if(!await appealSchema.exists({ id: user.id })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} ${user} has no appeals!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const state = {
                "APPROVED": "🟢",
                "DENIED": "🔴",
                "NOT_REVIEWED": "🟠"
            }

            const data = await appealSchema.find({ id: user.id });

            const appeals = [];

            for(const appeal of data) {
                appeals.push(`${state[appeal.status]} \`${appeal._id}\``);
            }

            const appealData = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: user.tag.endsWith("#0") ? user.username : user.tag, iconURL: user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${user.id}` })
                .setTitle("📄 Appeals")
                .setDescription(appeals.join("\n"))

            await interaction.editReply({ embeds: [appealData] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
