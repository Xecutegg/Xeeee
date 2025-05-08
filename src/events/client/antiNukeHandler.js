import { EmbedBuilder, Colors, Events, AuditLogEvent } from 'discord.js';
import antiNuke from '../../utils/antiNuke.js';

export default {
    name: "ready",
    async run() {
        // Ensure client is correctly passed to the execute method
        await this.execute(this.client);
    },
    isEvent: true,
    type: "ready", // Register once on startup
    async execute(client) {
        // Check if client and client.db exist
        if (!client || !client.db) {
            console.error('Client or client.db is undefined in antiNukeHandler');
            return;
        }
        
        // Initialize the anti-nuke system for all guilds
        await initializeAntiNuke(client);
        
        // Channel Delete Handler
        client.on(Events.ChannelDelete, async (channel) => {
            if (!channel.guild) return;
            
            try {
                // Verify client.db exists within the event handler
                if (!client.db) {
                    console.error('client.db is undefined in channel delete handler');
                    return;
                }
                
                const guildData = await client.db.Guild.findOne({ guildId: channel.guild.id });
                if (!guildData || !guildData.antiNuke || !guildData.antiNuke.enabled) return;
                
                await antiNuke.handleAuditLogEvent(channel.guild, 'channelDelete', { channel });
            } catch (error) {
                console.error('Error in channel delete handler:', error);
            }
        });
        
        // Role Delete Handler
        client.on(Events.GuildRoleDelete, async (role) => {
            try {
                // Verify client.db exists within the event handler
                if (!client.db) {
                    console.error('client.db is undefined in role delete handler');
                    return;
                }
                
                const guildData = await client.db.Guild.findOne({ guildId: role.guild.id });
                if (!guildData || !guildData.antiNuke || !guildData.antiNuke.enabled) return;
                
                await antiNuke.handleAuditLogEvent(role.guild, 'roleDelete', { role });
            } catch (error) {
                console.error('Error in role delete handler:', error);
            }
        });
        
        // Ban Handler
        client.on(Events.GuildBanAdd, async (ban) => {
            try {
                // Verify client.db exists within the event handler
                if (!client.db) {
                    console.error('client.db is undefined in ban handler');
                    return;
                }
                
                const guildData = await client.db.Guild.findOne({ guildId: ban.guild.id });
                if (!guildData || !guildData.antiNuke || !guildData.antiNuke.enabled) return;
                
                await antiNuke.handleAuditLogEvent(ban.guild, 'memberBan', { ban });
            } catch (error) {
                console.error('Error in ban handler:', error);
            }
        });
        
        // Member Remove Handler (for kicks)
        client.on(Events.GuildMemberRemove, async (member) => {
            try {
                // Verify client.db exists within the event handler
                if (!client.db) {
                    console.error('client.db is undefined in member remove handler');
                    return;
                }
                
                const guildData = await client.db.Guild.findOne({ guildId: member.guild.id });
                if (!guildData || !guildData.antiNuke || !guildData.antiNuke.enabled) return;
                
                // Check if this was a kick (vs a leave) by checking the audit logs
                const auditLogs = await member.guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberKick,
                    limit: 1
                }).catch(() => null);
                
                if (auditLogs && auditLogs.entries.size > 0) {
                    const kickLog = auditLogs.entries.first();
                    
                    // If the kicked user matches our member and the kick is recent (within 5 seconds)
                    if (kickLog && kickLog.target.id === member.id && 
                        Date.now() - kickLog.createdTimestamp < 5000) {
                        
                        await antiNuke.handleAuditLogEvent(member.guild, 'memberKick', { member });
                    }
                }
            } catch (error) {
                console.error('Error in member remove handler:', error);
            }
        });
        
        // Member Add Handler (for bot additions)
        client.on(Events.GuildMemberAdd, async (member) => {
            if (!member.user.bot) return; // Only care about bot additions
            
            try {
                // Verify client.db exists within the event handler
                if (!client.db) {
                    console.error('client.db is undefined in bot add handler');
                    return;
                }
                
                const guildData = await client.db.Guild.findOne({ guildId: member.guild.id });
                if (!guildData || !guildData.antiNuke || !guildData.antiNuke.enabled) return;
                
                await antiNuke.handleAuditLogEvent(member.guild, 'botAdd', { member });
            } catch (error) {
                console.error('Error in bot add handler:', error);
            }
        });
        
        console.log('✅ Anti-nuke protection system initialized');
    }
};

// Helper function to initialize anti-nuke for all guilds
async function initializeAntiNuke(client) {
    try {
        // Check if client and client.db exist
        if (!client || !client.db) {
            console.error('Client or client.db is undefined in initializeAntiNuke');
            return;
        }
        
        // Fetch all guilds with anti-nuke settings from the database
        const guilds = await client.db.Guild.find({ 'antiNuke.enabled': true });
        
        for (const guildData of guilds) {
            const guild = client.guilds.cache.get(guildData.guildId);
            if (!guild) continue;
            
            // Initialize this guild with its settings
            antiNuke.initGuild(guild.id, {
                enabled: true,
                thresholds: {
                    channelDelete: guildData.antiNuke.thresholds?.channelDelete || { limit: 3, time: 10000 },
                    roleDelete: guildData.antiNuke.thresholds?.roleDelete || { limit: 3, time: 10000 },
                    memberBan: guildData.antiNuke.thresholds?.memberBan || { limit: 5, time: 10000 },
                    memberKick: guildData.antiNuke.thresholds?.memberKick || { limit: 5, time: 10000 },
                    botAdd: guildData.antiNuke.thresholds?.botAdd || { limit: 2, time: 30000 }
                },
                punishment: guildData.antiNuke.punishment || 'removePerms',
                logChannel: guildData.antiNuke.logChannel || null,
                trustedUsers: guildData.antiNuke.trustedUsers || [],
                whitelistedRoles: guildData.antiNuke.whitelistedRoles || []
            });
            
            console.log(`Anti-nuke initialized for guild: ${guild.name}`);
        }
    } catch (error) {
        console.error('Error initializing anti-nuke:', error);
    }
}