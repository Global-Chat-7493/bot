import Button from "../../classes/Button";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { ButtonInteraction } from "discord.js";

import Task from "../../models/Task";

const button: Button = {
    name: "refresh-task-list",
    startsWith: false,
    requiredRoles: new Roles(["dev"]),
    async execute(interaction: ButtonInteraction, client: ExtendedClient, Discord: any) {
        const data = await Task.find();

        const todoList = [];

        const priority: any = {
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

export = button;
