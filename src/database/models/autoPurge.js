import mongoose from "mongoose";

const autoPurgeSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    interval: { type: Number, required: true }, // in seconds
    lastPurged: { type: Date, default: Date.now }
});

export default mongoose.model("AutoPurge", autoPurgeSchema);
