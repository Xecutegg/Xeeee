import mongoose from "mongoose";

const autoResponderSchema = new mongoose.Schema({
    guildId: { type: String, required: true },  // Server ID
    trigger: { type: String, required: true }, // Trigger phrase
    response: { type: String, required: true }, // Response message
    isEmbed: { type: Boolean, default: false }, // Whether the response is an embed
    embedOptions: { type: Object, default: {} }, // Embed customization
    status: { type: Boolean, default: true, enum: [true, false] }, // Active or not
    createdBy: { type: String, required: true }, // User ID who created it
}, { timestamps: true });

const AutoResponder = mongoose.model("AutoResponder", autoResponderSchema);
export default AutoResponder;