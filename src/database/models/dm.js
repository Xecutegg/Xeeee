import mongoose from 'mongoose';

const stickyMessageSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        trim: true,
    },
    messageId: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    channelId: {
        type: String,
        required: true,
        trim: true,
    },
    deleteDuration: {
        type: String,
        default: null,
        trim: true,
    },
    type: {
        type: String,
        default: "message",
        enum: ["message", "embed"],
    },
    embedOptions: {
        type: Object,
        default: {},
    },
    status: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false, // ⛔ Removes unnecessary __v field
});

export default mongoose.models.StickyMessage || mongoose.model('StickyMessage', stickyMessageSchema);
