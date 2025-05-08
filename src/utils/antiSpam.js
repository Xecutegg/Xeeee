// filepath: d:\Xeeee\src\utils\antiSpam.js
import { Collection } from 'discord.js';

class AntiSpamManager {
    constructor() {
        this.userMessages = new Collection();
        this.warningUsers = new Collection();
        this.mutedUsers = new Collection();
        this.options = {
            warnThreshold: 3,       // Number of messages before warning
            muteThreshold: 5,       // Number of messages before muting  
            banThreshold: 7,        // Number of messages before banning
            maxInterval: 2000,      // Amount of time (ms) in which messages are considered spam
            warnMessage: '{@user}, please stop spamming.',
            muteMessage: '**{user_tag}** has been muted for spamming.',
            banMessage: '**{user_tag}** has been banned for spamming.',
            maxDuplicates: 7,       // Amount of duplicate messages needed to be considered spam
            ignoreBots: true,       // Whether to ignore bot messages
            ignoredUsers: [],       // Array of User IDs that are ignored
            ignoredRoles: [],       // Array of Role IDs that are ignored
            ignoredChannels: [],    // Array of Channel IDs that are ignored
            ignoredPermissions: [], // Array of Permission flags that are ignored
            muteDuration: 10 * 60 * 1000, // Mute duration in milliseconds (10 minutes)
            removeMessages: true    // Whether to remove the spam messages
        };
        
        // Clean up the collections every 30 minutes
        setInterval(() => {
            this.userMessages.sweep(messages => {
                return Date.now() - messages[messages.length - 1].createdTimestamp > 1800000;
            });
        }, 1800000);
    }

    /**
     * Set custom options for the anti-spam instance
     * @param {Object} options - Configuration options
     */
    setOptions(options) {
        this.options = { ...this.options, ...options };
    }

    /**
     * Check a message for spam
     * @param {Object} message - The message object to check
     * @returns {Promise<boolean>} Whether or not the message is spam
     */
    async checkMessage(message) {
        if (!message.guild || !message.member) return false;
        
        const { author, guild, channel, content, member } = message;
        
        // Ignore specified users
        if (this.options.ignoredUsers.includes(author.id)) return false;
        
        // Ignore bots if specified
        if (this.options.ignoreBots && author.bot) return false;
        
        // Ignore specific channels
        if (this.options.ignoredChannels.includes(channel.id)) return false;
        
        // Ignore users with specific roles
        if (member.roles.cache.some(role => this.options.ignoredRoles.includes(role.id))) return false;
        
        // Ignore users with specific permissions
        if (this.options.ignoredPermissions.length > 0 && 
            this.options.ignoredPermissions.some(permission => member.permissions.has(permission))) {
            return false;
        }
        
        // Get the user's messages
        let userData = this.userMessages.get(author.id);
        
        if (!userData) {
            userData = [];
            this.userMessages.set(author.id, userData);
        }
        
        // Add the new message to the user's data
        userData.push({
            content,
            createdTimestamp: Date.now()
        });
        
        // Remove old messages outside the spam interval
        const oldMessages = userData.filter(msg => {
            return Date.now() - msg.createdTimestamp > this.options.maxInterval;
        });
        
        oldMessages.forEach(oldMessage => {
            const index = userData.indexOf(oldMessage);
            if (index !== -1) userData.splice(index, 1);
        });
        
        // Check for duplicate messages
        const duplicateMessages = userData.filter(msg => msg.content === content);
        
        if (duplicateMessages.length >= this.options.maxDuplicates) {
            // Apply punishment
            await this.punishUser(message);
            return true;
        }
        
        // Check for spam based on message frequency
        if (userData.length >= this.options.warnThreshold) {
            // Apply punishment
            await this.punishUser(message);
            return true;
        }
        
        return false;
    }
    
    /**
     * Apply the appropriate punishment to a user
     * @param {Object} message - The message object
     */
    async punishUser(message) {
        const { member, author, guild, channel } = message;
        const userId = author.id;
        
        // Get user data
        let warningCount = this.warningUsers.get(userId) || 0;
        
        // Remove spam messages if configured
        if (this.options.removeMessages) {
            const userMessages = this.userMessages.get(userId);
            const channelMessages = await channel.messages.fetch({ limit: 100 });
            
            const userChannelMessages = channelMessages.filter(msg => {
                return msg.author.id === userId && 
                       Date.now() - msg.createdTimestamp < this.options.maxInterval;
            });
            
            // Bulk delete the messages if possible
            if (userChannelMessages.size >= 2) {
                await channel.bulkDelete(userChannelMessages).catch(() => {});
            } else {
                userChannelMessages.forEach(msg => msg.delete().catch(() => {}));
            }
        }
        
        warningCount++;
        this.warningUsers.set(userId, warningCount);
        
        // Handle based on warning count
        if (warningCount >= this.options.banThreshold) {
            // Ban the user
            if (member.bannable) {
                await member.ban({ reason: 'Spam detection: Excessive spam' }).catch(() => {});
                channel.send(this.options.banMessage.replace('{user_tag}', author.tag));
            }
            
            // Reset warning count after ban
            this.warningUsers.delete(userId);
            
        } else if (warningCount >= this.options.muteThreshold) {
            // Check if user is already muted
            if (this.mutedUsers.has(userId)) return;
            
            // Mute the user if they have timeout permissions
            if (member.moderatable) {
                await member.timeout(this.options.muteDuration, 'Spam detection: Excessive messages')
                    .catch(() => {});
                
                channel.send(this.options.muteMessage.replace('{user_tag}', author.tag));
                
                // Add to muted users collection
                this.mutedUsers.set(userId, Date.now() + this.options.muteDuration);
                
                // Set timeout to remove from muted list
                setTimeout(() => {
                    this.mutedUsers.delete(userId);
                }, this.options.muteDuration);
            }
            
        } else {
            // Just warn the user for now
            channel.send(this.options.warnMessage.replace('{@user}', `<@${userId}>`));
        }
    }
}

const antiSpam = new AntiSpamManager();
export default antiSpam;