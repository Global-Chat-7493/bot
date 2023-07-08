const emoji = require("../../config.json").emojis;

const immuneSchema = require("../../models/immuneSchema");

module.exports = {
	name: "immunity",
	description: "Manage immunity to moderator commands.",
    options: [
        {
            type: 1,
            name: "add",
            description: "[OWNER ONLY] Make someone immune to moderator commands.",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "The user to get immunity.",
                    required: true
                }
            ]
        },

        {
            type: 1,
            name: "remove",
            description: "[DEVELOPER ONLY] Remove someone's immunity to moderator commands.",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "The user to remove immunity from.",
                    required: true
                }
            ]
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
            const user = interaction.options.getUser("user");
            const logsChannel = client.channels.cache.get(client.config_channels.logs);

            if(interaction.options.getSubcommand() === "add") {
                if(user.bot) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} You cannot make a bot immune!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                if(await immuneSchema.exists({ _id: user.id })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} ${user} is already immune!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                new immuneSchema({ _id: user.id }).save();

                const added = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} ${user} has recieved immunity to moderator commands.`)

                await interaction.editReply({ embeds: [added] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("Immunity Added")
                    .addFields (
                        { name: "👤 User", value: `${user}` }
                    )
                    .setTimestamp()

                logsChannel.send({ embeds: [log] });
                return;
            }

            if(interaction.options.getSubcommand() === "remove") {
                if(!await immuneSchema.exists({ _id: user.id })) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} ${user} is not immune!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                await immuneSchema.findOneAndDelete({ _id: user.id });

                const removed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`${emoji.tick} ${user} is no longer immune to moderator commands.`)

                await interaction.editReply({ embeds: [removed] });

                const log = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: interaction.user.tag.endsWith("#0") ? `@${interaction.user.username}` : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${interaction.user.id}` })
                    .setTitle("Immunity Removed")
                    .addFields (
                        { name: "👤 User", value: `${user}` }
                    )
                    .setTimestamp()

                logsChannel.send({ embeds: [log] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
