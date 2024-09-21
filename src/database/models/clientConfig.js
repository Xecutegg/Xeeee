import mongoose from "mongoose";
const ConfigSchema = mongoose.Schema({
    prefix: {
        type: String,
        default: "!"
    },
    botOwner: {
        type: Array,
        default: ["841319721860988931"]
    },
    botLog: {
        type: String,
        default: "1094484760279126046"
    },
    blocklistusers: {
        type: Array,
        default: [{
            id: String,
            reason: String
        }]
    },
    blocklistguilds: {
        type: Array,
        default: []
    }
});

export default mongoose.model("Config", ConfigSchema);
