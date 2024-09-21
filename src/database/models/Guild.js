import { Schema, model } from 'mongoose';

const guildSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: '!' },
  is247: { type: Boolean, default: false },
});

const Guild = model('Guild', guildSchema);
export default Guild;
