import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  uid: { type: String, default: '' },
  inGameName: { type: String, default: '' },
  youtubeChannelScreenshot: { type: String, default: '' },
  instagramProfileScreenshot: { type: String, default: '' },
  contactWhatsapp: { type: String, default: '' },
  isLeader: { type: Boolean, default: false },
});

const registrationSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  teamIgl: {type: String, required: true},
  isApproved: { type: Boolean, default: false },
  isRejected: { type: Boolean, default: false },
  teamName: { type: String, required: true },
  teamLogo: { type: String, default: '' },
  emailAddress: { type: String, required: true },
  haveAgreedToRules: { type: String, required: true },
  teamLeaderContactWhatsapp: { type: String, required: true },
  players: { type: [playerSchema], required: true }, // <-- array of playerSchema
});

export default mongoose.model('Registration', registrationSchema);
