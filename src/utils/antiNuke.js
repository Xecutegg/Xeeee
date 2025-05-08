// filepath: d:\Xeeee\src\utils\antiNuke.js
import { Collection, AuditLogEvent, PermissionFlagsBits } from 'discord.js';

class AntiNukeManager {
    constructor() {
        this.guildSettings = new Collection();
        this.actionLogs = new Collection();
        this.defaultThresholds = {
            channelDelete: { limit: 3, time: 10000 }, // 3 channels in 10 seconds
            roleDelete: { limit: 3, time: 10000 },    // 3 roles in 10 seconds
            memberBan: { limit: 5, time: 10000 },     // 5 bans in 10 seconds
            memberKick: { limit: 5, time: 10000 },    // 5 kicks in 10 seconds
            botAdd: { limit: 2, time: 30000 }         // 2 bots in 30 seconds
        };
        this.defaultPunishment = 'removePerms'; // ban, kick, removePerms
        this.trustedUsers = new Collection(); // Users who are trusted and won't be punished
        this.whitelistedRoles = new Collection(); // Roles that are exempt from anti-nuke
        
        // Clean up old action logs periodically
        setInterval(() => this.cleanupActionLogs(), 5 * 60 * 1000);
    }
    
    /**
     * Initialize the anti-nuke system for a guild
     * @param {string} guildId - The guild ID to initialize settings for
     * @param {Object} settings - Custom settings for this guild
     */
    initGuild(guildId, settings = {}) {
        const currentSettings = this.guildSettings.get(guildId) || {};
        
        this.guildSettings.set(guildId, {
            enabled: settings.enabled ?? true,
            thresholds: {
                ...this.defaultThresholds,
                ...settings.thresholds
            },
            punishment: settings.punishment || this.defaultPunishment,
            logChannel: settings.logChannel || null,
            trustedUsers: settings.trustedUsers || [],
            whitelistedRoles: settings.whitelistedRoles || []
        });
        
        // Initialize action logs for this guild if not already set
        if (!this.actionLogs.has(guildId)) {
            this.actionLogs.set(guildId, new Collection());
        }
    }
    
    /**
     * Add a trusted user who will not trigger anti-nuke
     * @param {string} guildId - The guild ID
     * @param {string} userId - The user ID to trust
     */
    addTrustedUser(guildId, userId) {
        const settings = this.guildSettings.get(guildId);
        if (!settings) this.initGuild(guildId);
        
        const guildSettings = this.guildSettings.get(guildId);
        if (!guildSettings.trustedUsers.includes(userId)) {
            guildSettings.trustedUsers.push(userId);
        }
    }
    
    /**
     * Remove a trusted user
     * @param {string} guildId - The guild ID
     * @param {string} userId - The user ID to remove from trusted list
     */
    removeTrustedUser(guildId, userId) {
        const settings = this.guildSettings.get(guildId);
        if (!settings) return false;
        
        const index = settings.trustedUsers.indexOf(userId);
        if (index > -1) {
            settings.trustedUsers.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Add a whitelisted role that won't trigger anti-nuke
     * @param {string} guildId - The guild ID
     * @param {string} roleId - The role ID to whitelist
     */
    addWhitelistedRole(guildId, roleId) {
        const settings = this.guildSettings.get(guildId);
        if (!settings) this.initGuild(guildId);
        
        const guildSettings = this.guildSettings.get(guildId);
        if (!guildSettings.whitelistedRoles.includes(roleId)) {
            guildSettings.whitelistedRoles.push(roleId);
        }
    }
    
    /**
     * Remove a whitelisted role
     * @param {string} guildId - The guild ID
     * @param {string} roleId - The role ID to remove from whitelist
     */
    removeWhitelistedRole(guildId, roleId) {
        const settings = this.guildSettings.get(guildId);
        if (!settings) return false;
        
        const index = settings.whitelistedRoles.indexOf(roleId);
        if (index > -1) {
            settings.whitelistedRoles.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Check if a user is trusted
     * @param {string} guildId - The guild ID
     * @param {string} userId - The user ID to check
     * @returns {boolean} Whether the user is trusted
     */
    isTrustedUser(guildId, userId) {
        const settings = this.guildSettings.get(guildId);
        if (!settings) return false;
        return settings.trustedUsers.includes(userId);
    }
    
    /**
     * Check if a role is whitelisted
     * @param {string} guildId - The guild ID
     * @param {string} roleId - The role ID to check
     * @returns {boolean} Whether the role is whitelisted
     */
    isWhitelistedRole(guildId, roleId) {
        const settings = this.guildSettings.get(guildId);
        if (!settings) return false;
        return settings.whitelistedRoles.includes(roleId);
    }
    
    /**
     * Log an action and check if it exceeds thresholds
     * @param {string} guildId - The guild ID
     * @param {string} userId - The user who performed the action
     * @param {string} actionType - The type of action performed
     * @returns {boolean} Whether the action exceeds thresholds
     */
    logAction(guildId, userId, actionType) {
        const settings = this.guildSettings.get(guildId);
        if (!settings || !settings.enabled) return false;
        
        // Don't log actions for trusted users
        if (this.isTrustedUser(guildId, userId)) return false;
        
        // Initialize the action logs for this guild if they don't exist
        if (!this.actionLogs.has(guildId)) {
            this.actionLogs.set(guildId, new Collection());
        }
        
        const guildActions = this.actionLogs.get(guildId);
        
        // Initialize the user actions if they don't exist
        if (!guildActions.has(userId)) {
            guildActions.set(userId, {});
        }
        
        const userActions = guildActions.get(userId);
        
        // Initialize the specific action type if it doesn't exist
        if (!userActions[actionType]) {
            userActions[actionType] = [];
        }
        
        // Add the current timestamp for this action
        userActions[actionType].push(Date.now());
        
        // Check if the user has exceeded the threshold for this action type
        const threshold = settings.thresholds[actionType];
        if (!threshold) return false;
        
        const { limit, time } = threshold;
        
        // Filter actions to only those within the time window
        const recentActions = userActions[actionType].filter(timestamp => {
            return Date.now() - timestamp < time;
        });
        
        // Update the actions array to only include recent ones
        userActions[actionType] = recentActions;
        
        // Check if the number of recent actions exceeds the limit
        return recentActions.length >= limit;
    }
    
    /**
     * Clean up old action logs to prevent memory leaks
     */
    cleanupActionLogs() {
        this.actionLogs.forEach((guildActions, guildId) => {
            guildActions.forEach((userActions, userId) => {
                // For each action type, filter out old timestamps
                Object.keys(userActions).forEach(actionType => {
                    const settings = this.guildSettings.get(guildId);
                    if (!settings) return;
                    
                    const threshold = settings.thresholds[actionType];
                    if (!threshold) return;
                    
                    userActions[actionType] = userActions[actionType].filter(timestamp => {
                        return Date.now() - timestamp < threshold.time * 2; // Keep entries for twice the threshold time
                    });
                    
                    // If no actions remain, delete this action type
                    if (userActions[actionType].length === 0) {
                        delete userActions[actionType];
                    }
                });
                
                // If no action types remain, delete this user
                if (Object.keys(userActions).length === 0) {
                    guildActions.delete(userId);
                }
            });
            
            // If no users remain, delete this guild
            if (guildActions.size === 0) {
                this.actionLogs.delete(guildId);
            }
        });
    }
    
    /**
     * Handle a guild audit log event
     * @param {Object} guild - The guild where the event occurred
     * @param {string} actionType - The type of action that occurred
     * @param {Object} options - Additional options for handling the event
     * @returns {Promise<void>}
     */
    async handleAuditLogEvent(guild, actionType, options = {}) {
        if (!guild.available) return;
        
        const settings = this.guildSettings.get(guild.id);
        if (!settings || !settings.enabled) return;
        
        let auditLogType;
        
        // Map actionType to AuditLogEvent type
        switch (actionType) {
            case 'channelDelete':
                auditLogType = AuditLogEvent.ChannelDelete;
                break;
            case 'roleDelete':
                auditLogType = AuditLogEvent.RoleDelete;
                break;
            case 'memberBan':
                auditLogType = AuditLogEvent.MemberBanAdd;
                break;
            case 'memberKick':
                auditLogType = AuditLogEvent.MemberKick;
                break;
            case 'botAdd':
                auditLogType = AuditLogEvent.MemberAdd;
                break;
            default:
                return; // Unrecognized action type
        }
        
        try {
            // Fetch the latest entry in the audit log for this action
            const auditLogs = await guild.fetchAuditLogs({
                type: auditLogType,
                limit: 1
            });
            
            const logEntry = auditLogs.entries.first();
            if (!logEntry) return;
            
            // If the log entry is too old (more than 5 seconds), ignore it
            if (Date.now() - logEntry.createdTimestamp > 5000) return;
            
            const { executor } = logEntry;
            if (!executor) return;
            
            // If the executor is the bot itself, ignore it
            if (executor.id === guild.client.user.id) return;
            
            // For bot additions, check if the target is a bot
            if (actionType === 'botAdd') {
                const target = logEntry.target;
                if (!target || !target.bot) return; // Not a bot addition
            }
            
            // Check if the user has a whitelisted role
            const executorMember = await guild.members.fetch(executor.id).catch(() => null);
            if (executorMember) {
                const hasWhitelistedRole = executorMember.roles.cache.some(role => 
                    this.isWhitelistedRole(guild.id, role.id)
                );
                
                if (hasWhitelistedRole) return;
            }
            
            // Log this action and check if it exceeds thresholds
            const exceedsThreshold = this.logAction(guild.id, executor.id, actionType);
            
            if (exceedsThreshold) {
                await this.applyPunishment(guild, executor.id, executorMember, actionType, options);
            }
            
        } catch (error) {
            console.error(`Error handling audit log event: ${error}`);
        }
    }
    
    /**
     * Apply punishment to a user who has triggered anti-nuke
     * @param {Object} guild - The guild where the action occurred
     * @param {string} userId - The user ID to punish
     * @param {Object} member - The guild member to punish (optional)
     * @param {string} actionType - The type of action that triggered punishment
     * @param {Object} options - Additional options for the punishment
     * @returns {Promise<void>}
     */
    async applyPunishment(guild, userId, member, actionType, options = {}) {
        const settings = this.guildSettings.get(guild.id);
        if (!settings) return;
        
        let punishment = settings.punishment;
        
        // If no member object was provided, try to fetch it
        if (!member) {
            member = await guild.members.fetch(userId).catch(() => null);
        }
        
        // If we can't get the member, default to ban punishment
        if (!member) {
            punishment = 'ban';
        }
        
        // Log the anti-nuke event
        console.log(`[Anti-Nuke] ${actionType} threshold exceeded by ${userId} in ${guild.id}`);
        
        try {
            switch (punishment) {
                case 'ban':
                    await guild.members.ban(userId, {
                        reason: `Anti-Nuke: ${actionType} threshold exceeded`
                    }).catch(console.error);
                    break;
                    
                case 'kick':
                    if (member) {
                        await member.kick(`Anti-Nuke: ${actionType} threshold exceeded`).catch(console.error);
                    }
                    break;
                    
                case 'removePerms':
                default:
                    if (member) {
                        // Store the user's roles
                        const userRoles = member.roles.cache
                            .filter(role => role.id !== guild.id) // Exclude @everyone role
                            .map(role => role.id);
                        
                        // Remove all roles
                        await member.roles.remove(userRoles, `Anti-Nuke: ${actionType} threshold exceeded`)
                            .catch(console.error);
                    }
                    break;
            }
            
            // Send notification to log channel if configured
            if (settings.logChannel) {
                try {
                    const logChannel = await guild.channels.fetch(settings.logChannel);
                    if (logChannel && logChannel.isTextBased()) {
                        await logChannel.send({
                            embeds: [{
                                title: '🛡️ Anti-Nuke System Triggered',
                                description: `A user has triggered the anti-nuke system.`,
                                fields: [
                                    { name: 'User', value: `<@${userId}> (${userId})`, inline: true },
                                    { name: 'Action', value: actionType, inline: true },
                                    { name: 'Punishment', value: punishment, inline: true }
                                ],
                                color: 0xff0000, // Red color
                                timestamp: new Date()
                            }]
                        });
                    }
                } catch (error) {
                    console.error(`Error sending to log channel: ${error}`);
                }
            }
            
        } catch (error) {
            console.error(`Error applying punishment: ${error}`);
        }
    }
}

const antiNuke = new AntiNukeManager();
export default antiNuke;