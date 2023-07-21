import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { CommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";

import Filter from "../../models/Filter";

const command: Command = {
    name: "filter",
    description: "Manage the bot's filters.",
    options: [
        {
            type: 1,
            name: "add",
            description: "[MODERATOR ONLY] Add a word to a filter.",
            options: [
                {
                    type: 3,
                    name: "word",
                    description: "The word you want to add to a filter.",
                    min_length: 3,
                    max_length: 64,
                    required: true
                },

                {
                    type: 3,
                    name: "filter",
                    description: "The filter you want to add the word to.",
                    choices: [
                        {
                            name: "autoban",
                            value: "autoban"
                        },

                        {
                            name: "blacklist",
                            value: "blacklist"
                        }
                    ],
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "list",
            description: "[MODERATOR ONLY] Get a list of the words on a filter.",
            options: [
                {
                    type: 3,
                    name: "filter",
                    description: "The filter you want a list of words from.",
                    choices: [
                        {
                            name: "autoban",
                            value: "autoban"
                        },

                        {
                            name: "blacklist",
                            value: "blacklist"
                        }
                    ],
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "remove",
            description: "[MODERATOR ONLY] Remove a word from a filter.",
            options: [
                {
                    type: 3,
                    name: "word",
                    description: "The word you want to remove from a filter.",
                    min_length: 3,
                    max_length: 64,
                    required: true
                },

                {
                    type: 3,
                    name: "filter",
                    description: "The filter you want to remove the word from.",
                    choices: [
                        {
                            name: "autoban",
                            value: "autoban"
                        },

                        {
                            name: "blacklist",
                            value: "blacklist"
                        }
                    ],
                    required: true
                }
            ]
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: new Roles(["mod"]),
    cooldown: 0,
    enabled: true,
    staffOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction & any, client: ExtendedClient & any, Discord: any) {
        try {
            if(interaction.options.getSubcommand() === "add") {
                const word = interaction.options.getString("word");
                const filter = interaction.options.getString("filter");

                const data = await Filter.findOne({ _id: filter });

                if(!data) {
                    new Filter({
                        _id: filter,
                        words: [word.toLowerCase()]
                    }).save()

                    const added = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.tick} That word has been added to the filter!`)

                    await interaction.editReply({ embeds: [added] });
                    return;
                }

                if(data.words.includes(word.toLowerCase())) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} That word is already on the filter!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                data.words.push(word.toLowerCase());

                await data.save();

                const added = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} That word has been added to the filter!`)

                await interaction.editReply({ embeds: [added] });
                return;
            }

            if(interaction.options.getSubcommand() === "list") {
                const filter = interaction.options.getString("filter");

                const data = await Filter.findOne({ _id: filter });

                if(!data) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} There are no words on the filter!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const filters: any = {
                    autoban: "Autoban",
                    blacklist: "Blacklist"
                }

                const list = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle(`${filters[filter]} Filter`)
                    .setDescription(`\`${data.words.sort().join("\`, \`")}\``)

                await interaction.editReply({ embeds: [list] });
                return;
            }

            if(interaction.options.getSubcommand() === "remove") {
                const word = interaction.options.getString("word");
                const filter = interaction.options.getString("filter");

                const data = await Filter.findOne({ _id: filter });

                if(!data) {
                    const none = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setDescription(`${emoji.tick} There are no words on the filter!`)

                    await interaction.editReply({ embeds: [none] });
                    return;
                }

                if(!data.words.includes(word.toLowerCase())) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} That word is not on the filter!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                data.words = data.words.filter((item: String) => item !== word.toLowerCase());

                await data.save();

                const removed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} That word has been removed from the filter!`)

                await interaction.editReply({ embeds: [removed] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
