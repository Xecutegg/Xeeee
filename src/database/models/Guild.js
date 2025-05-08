import { Schema, model } from 'mongoose';

const guildSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: '!' },
  is247: { type: Boolean, default: false },
  
  // Anti-spam configuration
  antiSpam: {
    enabled: { type: Boolean, default: false },
    warnThreshold: { type: Number, default: 3 },
    muteThreshold: { type: Number, default: 5 },
    banThreshold: { type: Number, default: 7 },
    maxInterval: { type: Number, default: 2000 },
    ignoredUsers: [{ type: String }],
    ignoredRoles: [{ type: String }],
    ignoredChannels: [{ type: String }],
    muteDuration: { type: Number, default: 600000 }, // 10 minutes in ms
    logChannel: { type: String, default: null }
  },
  
  // Anti-nuke configuration
  antiNuke: {
    enabled: { type: Boolean, default: false },
    thresholds: {
      channelDelete: {
        limit: { type: Number, default: 3 },
        time: { type: Number, default: 10000 }
      },
      roleDelete: {
        limit: { type: Number, default: 3 },
        time: { type: Number, default: 10000 }
      },
      memberBan: {
        limit: { type: Number, default: 5 },
        time: { type: Number, default: 10000 }
      },
      memberKick: {
        limit: { type: Number, default: 5 },
        time: { type: Number, default: 10000 }
      },
      botAdd: {
        limit: { type: Number, default: 2 },
        time: { type: Number, default: 30000 }
      }
    },
    punishment: { type: String, enum: ['ban', 'kick', 'removePerms'], default: 'removePerms' },
    logChannel: { type: String, default: null },
    trustedUsers: [{ type: String }],
    whitelistedRoles: [{ type: String }]
  }
});

const Guild = model('Guild', guildSchema);
export default Guild;
