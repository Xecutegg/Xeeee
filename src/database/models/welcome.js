import mongoose from "mongoose";

const welcomeSchema = new mongoose.Schema({
    guildId: { type: String },
    channelId: { type: String },
    deleteDuration: { type: String, default: "null" },
    type: { type: String, default: "message" },
    welcomeMessage: { type: String },
    embedOptions: { type: Object, default: {} }
});
const WelcomeSettings = mongoose.model('WelcomeSettings', welcomeSchema);
export default WelcomeSettings;