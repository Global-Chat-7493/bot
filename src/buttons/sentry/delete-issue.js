const emoji = require("../../config.json").emojis;
const fetch = require("node-fetch");

const devSchema = require("../../models/devSchema");

module.exports = {
    name: "sentry-delete",
    startsWith: true,
    async execute(interaction, client, Discord) {
        const dev = await devSchema.exists({ _id: interaction.user.id });

        if(!dev) {
            const error = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.cross} You do not have permission to perform this action!`)

            await interaction.reply({ embeds: [error], ephemeral: true });
            return;
        }

        const id = interaction.customId.replace("sentry-delete-", "");

        try {
            await fetch(`https://sentry.io/api/0/issues/${id}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${process.env.sentry_bearer}`
                }
            })
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
            return;
        }

        const deleted = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.red)
            .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
            .setTitle("🗑️ Deleted")
            .setTimestamp()

        interaction.message.components[0].components[0].data.disabled = true;
        interaction.message.components[0].components[1].data.disabled = true;
        interaction.message.components[0].components[2].data.disabled = true;

        interaction.message.embeds.push(deleted);

        await interaction.deferUpdate();

        await interaction.message.edit({ embeds: interaction.message.embeds, components: interaction.message.components });
    }
}
