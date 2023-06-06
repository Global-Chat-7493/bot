module.exports = async function cleanChannels(client) {
    const schema = require("../../models/channelSchema");
    const checkWebhook = require("../checkWebhook");

    const data = await schema.find();

    const promises = [];

    const validGuilds = [];
    const modifiedData = [];
    const removedData = [];

    // Valid Guilds
    for(const [guildId, guild] of client.guilds.cache) {
        promises.push(new Promise(async resolve => {
        	validGuilds.push(guildId);
            resolve();
        }))
    }

    // Remove Invalid Guilds
    for(const document of data) {
        promises.push(new Promise(async resolve => {
            if(validGuilds.includes(document._id)) return resolve();

            await schema.findOneAndDelete({ _id: document._id });

            removedData.push(document._id);
            resolve(`Deleted: ${document._id}`);
        }))
    }

    // Check Webhooks
    for(const document of data) {
        promises.push(new Promise(async resolve => {
            if(document.webhook) {
                if(!(await checkWebhook(document.webhook))) {
                    await schema.findOneAndUpdate({ _id: document._id }, { webhook: null });

                    modifiedGuilds.push(document._id);
                    resolve(`Modified: ${document._id}`);
                }
            }
        }))
    }

    await Promise.all(promises);

    return {
        "modified": modifiedData,
        "removed": removedData
    }
}