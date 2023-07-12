const emoji = require("../../config").emojis;

const Task = require("../../models/Task");

module.exports = {
    name: "get-task",
    startsWith: false,
    requiredRoles: [],
    async execute(interaction, client, Discord) {
        const data = await Task.find();

        const priority = {
            high: "🔴",
            medium: "🟠",
            low: "🟢",
            none: "⚪",
            text: {
                high: "🔴 High",
                medium: "🟠 Medium",
                low: "🟢 Low",
                none: "⚪ None"
            }
        }

        if(!data.length) {
            const error = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.error)
                .setDescription(`${emoji.cross} There are no tasks!`)

            await interaction.reply({ embeds: [error], ephemeral: true });
            return;
        }

        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId(`select-menu-${interaction.id}`)
            .setPlaceholder("Select a task")

        for(const todo of data) {
            menu.addOptions (
                new Discord.StringSelectMenuOptionBuilder()
                    .setEmoji(`${priority[todo.priority]}`)
                    .setLabel(`${todo.name}`)
                    .setValue(todo._id)
            )
        }

        const row = new Discord.ActionRowBuilder().addComponents(menu);

        await interaction.reply({ components: [row], ephemeral: true });

        client.on("interactionCreate", async i => {
            if(!i.isStringSelectMenu()) return;

            if(i.customId === `select-menu-${interaction.id}`) {
                const value = i.values[0];

                const todo = await Task.findOne({ _id: value });

                if(!todo) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} That task does not exist!`)

                    await interaction.editReply({ embeds: [error], ephemeral: true });
                    return;
                }

                const info = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle(`${todo.name}`)
                    .setDescription(`${todo.description || "*No description provided.*"}`)
                    .addFields (
                        { name: "❗ Priority", value: priority.text[todo.priority] },
                        { name: "🕰️ Created", value: `<t:${todo.timestamp.slice(0, -3)}> (<t:${todo.timestamp.slice(0, -3)}:R>)` },
                        { name: "👤 Added By", value: `<@${todo.added_by}>` }
                    )

                await interaction.editReply({ embeds: [info], components: [], ephemeral: true });
            }
        })
    }
}
