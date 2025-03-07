import mongoose from 'mongoose';

const snipeSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: String, required: true },
    createdAt: { type: Date, required: true }
});

export default mongoose.model('Snipe', snipeSchema);
