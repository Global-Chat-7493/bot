const Task = require("../../models/Task");

module.exports = {
    name: "refresh-task-list",
    startsWith: false,
    requiredRoles: [],
    async execute(interaction, client, Discord) {
        const data = await Task.find();

        const todoList = [];

        const priority = {
            high: "🔴",
            medium: "🟠",
            low: "🟢",
            none: "⚪"
        }

        for(const todo of data) {
            todoList.push(`${priority[todo.priority]} ${todo.name}`);
        }

        const list = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.default)
            .setTitle("📝 To-Do List")
            .setDescription(todoList.length ? todoList.join("\n") : "*There are no tasks.*")
            .addFields (
                { name: "❗ Priority", value: `🔴 High\n🟠 Medium\n🟢 Low\n⚪ None` }
            )
            .setTimestamp()

        await interaction.message.edit({ embeds: [list] });

        await interaction.deferUpdate();
    }
}
