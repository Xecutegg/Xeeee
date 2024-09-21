import { Schema, model } from 'mongoose';

const afkSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        maxlength: 200
    }
}, {
    timestamps: true
});

const Afk = model('Afk', afkSchema);
export default Afk;