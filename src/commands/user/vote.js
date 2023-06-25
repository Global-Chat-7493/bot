module.exports = {
    name: "vote",
    description: "Sends the voting link.",
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
                        .setLabel("Vote on Top.gg")
                        .setURL("https://wdh.gg/gc-vote")
                )

            await interaction.editReply({ components: [button] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
