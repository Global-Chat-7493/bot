module.exports = async function cleanChannels() {
    const schema = require("../../models/filterSchema");

    let autobanData = await schema.findOne({ _id: "autoban" }) || { words: [] };
    let blockData = await schema.findOne({ _id: "block" }) || { words: [] };

    const promises = [];

    let modifiedData = [];
    const removedData = [];

    for(const word of autobanData.words) {
        promises.push(new Promise(async resolve => {
            if(blockData.words.includes(word)) {
                blockData.words = blockData.words.filter(item => item !== word);

                await blockData.save();

                if(!modifiedData.includes("block")) modifiedData.push("block");

                resolve(`Modified: block`);
            } else {
                resolve();
            }
        }))
    }

    await Promise.all(promises);

    if(!autobanData.words.length && autobanData._id) {
        await autobanData.delete();

        removedData.push("autoban");
    }

    if(!blockData.words.length && blockData._id) {
        await blockData.delete();

        removedData.push("block");
    }

    return {
        "modified": modifiedData.filter(item => !removedData.includes(item)),
        "removed": removedData
    }
}
