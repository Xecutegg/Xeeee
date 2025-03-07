import mongoose from "mongoose";
const ConfigSchema = mongoose.Schema({
    prefix: {
        type: String,
        default: "X"
    },
    botOwner: {
        type: Array,
        default: ["162213250719547392"]
    },
    botLog: {
        type: String,
        default: "1347201055187796043"
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
    },
    np_users: {
        type: Array,
        default: []
    }
});

export default mongoose.model("Config", ConfigSchema);
