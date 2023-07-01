const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    project: String,
    channel: String,
    registered: String,
    user: String
})

module.exports = mongoose.model("sentry", schema, "sentry")