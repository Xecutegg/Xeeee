import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  approved: { type: Boolean, required: false },
  rejected: { type: Boolean, required: false },
  relevantExperience: { type: String, required: true },
  reasonToJoin: { type: String, required: true },
  positionsApplied: { type: String, required: true },
  name: { type: String, required: true },
  availability: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: String, required: true },
  discordName: { type: String, required: true },
  contactInfo: { type: String, required: true },
  timestamp: { type: String, required: true }
});

export default mongoose.model('Application', applicationSchema);
