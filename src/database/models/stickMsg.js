import mongoose from "mongoose";

const stickyMessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },  // ✅ Fixed from "guidlid" to "guildId"
    messageId: { type: String, required: true },
    message: { type: String, required: true },
    channelId: { type: String, required: true },
    deleteDuration: { type: String, default: null },
    type: { type: String, default: "message" },
    embedOptions: { type: Object, default: {} },
    status: { type: Boolean, default: true, enum: [true, false] }
}, { timestamps: true });

const StickyMessage = mongoose.model("StickyMessage", stickyMessageSchema);
export default StickyMessage;
// Compare this snippet from src/database/models/snipe.js:
// import mongoose from "mongoose";