import ExtendedClient from "../../classes/ExtendedClient";
import { ButtonInteraction, Interaction } from "discord.js";

import { emojis as emoji } from "../../config";

import BannedUser from "../../models/BannedUser";
import User from "../../models/User";

export = {
    name: "blocked-message-ban",
    startsWith: true,
    requiredRoles: ["mod"],
    async execute(interaction: ButtonInteraction & any, client: ExtendedClient & any, Discord: any) {
        try {
            const id = interaction.customId.replace("blocked-message-ban-", "");

            if(id === interaction.user.id) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You cannot ban yourself!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            if(await User.exists({ _id: id, immune: true })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You cannot ban that user!`)

                await interaction.reply({ embeds: [error], ephemeral: true });

                interaction.message.components[0].components[1].data.disabled = true;

                await interaction.message.edit({ embeds: interaction.message.embeds, components: interaction.message.components });
                return;
            }

            if(await BannedUser.exists({ _id: id })) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} That user is already banned!`)

                await interaction.reply({ embeds: [error], ephemeral: true });

                interaction.message.components[0].components[1].data.disabled = true;

                await interaction.message.edit({ embeds: interaction.message.embeds, components: interaction.message.components });
                return;
            }

            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const modal = new Discord.ModalBuilder()
                .setCustomId(`modal-${interaction.id}`)
                .setTitle("Ban User")

            const modalReason = new Discord.TextInputBuilder()
                .setCustomId(`modal-reason-${interaction.id}`)
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setLabel("Why should this user be banned?")
                .setPlaceholder("This user should be banned because...")
                .setMaxLength(250)
                .setRequired(true)

            const row = new Discord.ActionRowBuilder().addComponents(modalReason);

            modal.addComponents(row);

            await interaction.showModal(modal);

            client.on("interactionCreate", async (i: Interaction) => {
                if(!i.isModalSubmit()) return;

                if(i.customId === `modal-${interaction.id}`) {
                    const reason = i.fields.getTextInputValue(`modal-reason-${interaction.id}`);

                    const menu = new Discord.StringSelectMenuBuilder()
                        .setCustomId(`select-menu-${interaction.id}`)
                        .setPlaceholder("Should this ban be appealable?")
                        .addOptions (
                            new Discord.StringSelectMenuOptionBuilder()
                                .setEmoji("✅")
                                .setLabel("Yes")
                                .setValue("true"),

                            new Discord.StringSelectMenuOptionBuilder()
                                .setEmoji("❌")
                                .setLabel("No")
                                .setValue("false")
                        )

                    const row = new Discord.ActionRowBuilder().addComponents(menu);

                    await i.reply({ components: [row], ephemeral: true });

                    client.on("interactionCreate", async (i2: Interaction) => {
                        if(!i2.isStringSelectMenu()) return;

                        if(i2.customId === `select-menu-${interaction.id}`) {
                            const appealable = i2.values[0];

                            const user = await client.users.fetch(id);

                            new BannedUser({
                                _id: id,
                                timestamp: Date.now(),
                                allowAppeal: appealable === "true" ? true : false,
                                reason: reason,
                                mod: interaction.user.id
                            }).save()

                            const ban = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.error)
                                .setTitle("Banned")
                                .setDescription("ℹ️ You have been banned from using Global Chat.")
                                .addFields (
                                    { name: "❓ Reason", value: reason },
                                    { name: "📜 Appealable", value: appealable ? "✅" : "❌" }
                                )
                                .setTimestamp()

                            if(appealable) {
                                ban.addFields (
                                    { name: "ℹ️ How to Appeal", value: "1. Join the [support server](https://discord.gg/globalchat).\n2. Go to the [appeal channel](https://discord.com/channels/1067023529226293248/1094505532267704331).\n3. Click \`Submit\` and fill in the form.\n4. Wait for a response to your appeal." }
                                )
                            }

                            let sentDM = false;

                            try {
                                await user.send({ embeds: [ban] });
                                sentDM = true;
                            } catch {}

                            const banInfo = new Discord.EmbedBuilder()
                                .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                                .setTitle("Banned")
                                .addFields (
                                    { name: "❓ Reason", value: reason },
                                    { name: "📜 Appealable", value: appealable === "true" ? "✅" : "❌" }
                                )
                                .setTimestamp()

                            interaction.message.embeds.push(banInfo);
                            interaction.message.components[0].components[1].data.disabled = true;

                            await interaction.message.edit({ embeds: interaction.message.embeds, components: interaction.message.components });

                            const banned = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.default)
                                .setDescription(`${emoji.tick} ${user} has been banned.`)

                            await i.editReply({ embeds: [banned], components: [] });

                            const banLog = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.default)
                                .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                                .setTitle("User Banned")
                                .addFields (
                                    { name: "👤 User", value: `${user}` },
                                    { name: "🔔 User Notified", value: sentDM ? "✅" : "❌" },
                                    { name: "❓ Reason", value: reason },
                                    { name: "📜 Appealable", value: appealable === "true" ? "✅" : "❌" }
                                )
                                .setTimestamp()

                            modLogsChannel.send({ embeds: [banLog] });
                        }
                    })
                }
            })
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}
