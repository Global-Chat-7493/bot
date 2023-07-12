const emoji = require("../../config").emojis;

module.exports = {
    name: "eval",
    description: "[OWNER ONLY] Evaluate code on the bot.",
    options: [
        {
            type: 3,
            name: "code",
            description: "The code you want to evaluate.",
            max_length: 1000,
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["owner"],
    cooldown: 0,
    enabled: true,
    hidden: true,
    deferReply: true,
    ephemeral: false,
    async execute(interaction, client, Discord) {
        try {
            const input = interaction.options.getString("code");

            async function isSecret(input) {
                for(const key in process.env) {
                    if(process.env[key].toString() === input.toString()) return true;
                }

                return false;
            }

            try {
                const output = new String(await eval(input));

                if(await isSecret(output)) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} You cannot retrieve secret values!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .addFields (
                        { name: "Input", value: `\`\`\`${input}\`\`\`` },
                        { name: "Output", value: `\`\`\`${output}\`\`\`` }
                    )

                await interaction.editReply({ embeds: [result] });
            } catch(err) {
                const result = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .addFields (
                        { name: "Input", value: `\`\`\`${input}\`\`\`` },
                        { name: "Output", value: `\`\`\`${err.message}\`\`\`` }
                    )

                await interaction.editReply({ embeds: [result] });
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
