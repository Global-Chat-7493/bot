const emoji = require("../../config").emojis;

const Appeal = require("../../models/Appeal");

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
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            const user = interaction.options.getUser("user");

            const data = await Appeal.find({ id: user.id });

            if(!data.length) {
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
