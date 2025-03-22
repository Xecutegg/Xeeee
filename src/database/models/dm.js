import mongoose from 'mongoose';

const stickyMessageSchema = new mongoose.Schema({
    guildId: { type: String, required: true },  // ✅ FIXED TYPO
    messageId: { type: String, required: true },
    message: { type: String, required: true },
    channelId: { type: String, required: true },
    deleteDuration: { type: String, default: null },
    type: { type: String, default: "message" },
    embedOptions: { type: Object, default: {} },
    status: { type: Boolean, default: true, enum: [true, false] }
}, { timestamps: true });

const StickyMessage = mongoose.model('StickyMessage', stickyMessageSchema);
export default StickyMessage;
