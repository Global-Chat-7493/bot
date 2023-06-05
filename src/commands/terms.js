module.exports = {
    name: "terms",
    description: "Sends the terms and conditions link.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    hidden: false,
    async execute(interaction, client, Discord) {
        try {
            const button = new Discord.ActionRowBuilder()
                .addComponents (
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setLabel("Terms and Conditions")
                        .setURL("https://wdh.gg/gc-terms")
                )

            await interaction.editReply({ components: [button] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}