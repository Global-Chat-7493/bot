module.exports = async (message, client, chat) => {
    const role = await require("./get")(message.author, client);

    if(role.supporter) chat.setAuthor({ name: `${message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag} 💖`, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` });
    if(role.verified) chat.setAuthor({ name: `${message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag} ✅`, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` });
    if(role.mod) chat.setAuthor({ name: `${message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag} 🔨`, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` });
    if(role.dev) chat.setAuthor({ name: `${message.author.tag.endsWith("#0") ? `@${message.author.username}` : message.author.tag} 💻`, iconURL: message.author.displayAvatarURL({ format: "png", dynamic: true }), url: `https://discord.com/users/${message.author.id}` });
}
