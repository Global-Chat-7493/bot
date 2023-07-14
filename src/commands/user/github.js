const { createOAuthDeviceAuth } = require("@octokit/auth-oauth-device");
const { Octokit } = require("@octokit/core");

const emoji = require("../../config").emojis;

const GitHubUser = require("../../models/GitHubUser");

module.exports = {
    name: "github",
    description: "Manage your GitHub account linked to Global Chat.",
    options: [
        {
            type: 1,
            name: "account",
            description: "Get information about your linked GitHub account.",
            options: []
        },

        {
            type: 1,
            name: "link",
            description: "Link your GitHub account to Global Chat.",
            options: []
        },

        {
            type: 1,
            name: "unlink",
            description: "Unlink your GitHub account from Global Chat.",
            options: []
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 10,
    enabled: true,
    staffOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction, client, Discord) {
        try {
            if(interaction.options.getSubcommand() === "account") {
                let data = await GitHubUser.findOne({ _id: interaction.user.id });

                if(!data) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} You have not linked your GitHub account! Use \`/github link\` to login`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                const octokit = new Octokit({ auth: data.token });
                const user = (await octokit.request("GET /user", {})).data;

                const oldData = {
                    id: data.id,
                    avatar_url: data.avatar_url,
                    username: data.username,
                    email: data.email
                }

                const newData = {
                    id: user.id,
                    avatar_url: user.avatar_url,
                    username: user.login,
                    email: user.email
                }

                if(oldData.id !== newData.id || oldData.avatar_url !== newData.avatar_url || oldData.username !== newData.username || oldData.email !== newData.email) {
                    data = await GitHubUser.findOneAndUpdate({ _id: interaction.user.id }, {
                        id: user.id,
                        avatar_url: user.avatar_url,
                        username: user.login,
                        email: user.email,
                        lastUpdated: Date.now()
                    }, { returnOriginal: false })
                }

                const account = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.github)
                    .setThumbnail(data.avatar_url)
                    .setTitle("Your GitHub Account")
                    .addFields (
                        { name: "Username", value: data.username },
                        { name: "Email", value: data.email },
                        { name: "Linked", value: `<t:${data.linked.toString().slice(0, -3)}> (<t:${data.linked.toString().slice(0, -3)}:R>)` }
                    )

                const actions = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Danger)
                            .setCustomId("github-unlink")
                            .setLabel("Logout")
                    )

                await interaction.editReply({ embeds: [account], components: [actions] });
                return;
            }

            if(interaction.options.getSubcommand() === "link") {
                const data = await GitHubUser.findOne({ _id: interaction.user.id });

                if(data) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} You have already linked your GitHub account! Use \`/github unlink\` to logout.`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                let completed = false;

                const auth = createOAuthDeviceAuth({
                    clientType: "oauth-app",
                    clientId: process.env.github_client_id,
                    scopes: ["read:user, user:email, repo:invite"],
                    async onVerification(verify) {
                        const login = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.github)
                            .setThumbnail("https://avatars.githubusercontent.com/u/9919")
                            .setTitle("Link your GitHub account")
                            .setDescription(`1. Open the URL: ${verify.verification_uri}\n2. Enter the code: \`${verify.user_code}\``)
                            .setFooter({ text: `This prompt will expire in ${Math.round(verify.expires_in / 60)} minutes.` })
                            .setTimestamp()

                        await interaction.editReply({ embeds: [login] });

                        setTimeout(async () => {
                            if(completed) return;

                            const cancelled = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.error)
                                .setDescription(`${emoji.cross} Your GitHub login prompt has expired.`)

                            await interaction.editReply({ embeds: [cancelled] });
                        }, verify.expires_in * 1000);
                    }
                })

                const userAuth = await auth({ type: "oauth" });

                completed = true;

                const octokit = new Octokit({ auth: userAuth.token });

                const user = (await octokit.request("GET /user", {})).data;
                const emails = (await octokit.request("GET /user/emails", {})).data;

                let userEmail = "";

                emails.forEach(e => {
                    if(e.primary) userEmail = e.email;
                })

                new GitHubUser({
                    _id: interaction.user.id,
                    id: user.id,
                    avatar_url: user.avatar_url,
                    username: user.login,
                    email: userEmail,
                    token: userAuth.token,
                    linked: Date.now(),
                    lastUpdated: Date.now()
                }).save()

                const linked = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.github)
                    .setThumbnail(user.avatar_url)
                    .setTitle("GitHub Account Linked")
                    .addFields (
                        { name: "Username", value: user.login },
                        { name: "Email", value: userEmail }
                    )
                    .setTimestamp()

                await interaction.editReply({ embeds: [linked] });
                return;
            }

            if(interaction.options.getSubcommand() === "unlink") {
                const data = await GitHubUser.findOne({ _id: interaction.user.id });

                if(!data) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} You have not linked your GitHub account!`)

                    await interaction.editReply({ embeds: [error] });
                    return;
                }

                try {
                    const octokit = new Octokit({ auth: data.token });

                    await octokit.request('DELETE /applications/{client_id}/grant', {
                        client_id: process.env.github_client_id,
                        access_token: data.token
                    })
                } catch {}

                await data.delete();

                const unlinked = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.github)
                    .setDescription(`${emoji.tick} Your GitHub account has been unlinked.`)

                await interaction.editReply({ embeds: [unlinked] });
                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}
