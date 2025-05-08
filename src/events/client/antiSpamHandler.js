import { EmbedBuilder, Colors } from 'discord.js';
import antiSpam from '../../utils/antiSpam.js';

export default {
    name: "messageCreate",
    async run(message) {
        await this.execute(this.client, message);
    },
    isEvent: true,
    type: "messageCreate",
    async execute(client, message) {
        // Skip if message is not in a guild or is from a bot
        if (!message.guild || message.author.bot) return;
        
        try {
            // Check if the guild has anti-spam enabled in database
            const guildData = await client.db.Guild.findOne({ guildId: message.guild.id });
            if (!guildData || !guildData.antiSpam || !guildData.antiSpam.enabled) return;
            
            // Configure anti-spam options based on guild settings
            if (guildData.antiSpam) {
                antiSpam.setOptions({
                    warnThreshold: guildData.antiSpam.warnThreshold || 3,
                    muteThreshold: guildData.antiSpam.muteThreshold || 5,
                    banThreshold: guildData.antiSpam.banThreshold || 7,
                    maxInterval: guildData.antiSpam.maxInterval || 2000,
                    ignoredUsers: guildData.antiSpam.ignoredUsers || [],
                    ignoredRoles: guildData.antiSpam.ignoredRoles || [],
                    ignoredChannels: guildData.antiSpam.ignoredChannels || [],
                    muteDuration: guildData.antiSpam.muteDuration || 10 * 60 * 1000
                });
            }
            
            // Check the message for spam
            await antiSpam.checkMessage(message);
            
            // If configured, log spam events to a channel
            if (guildData.antiSpam && guildData.antiSpam.logChannel) {
                const isSpam = antiSpam.userMessages.get(message.author.id)?.length >= antiSpam.options.warnThreshold;
                
                if (isSpam) {
                    const logChannel = message.guild.channels.cache.get(guildData.antiSpam.logChannel);
                    if (logChannel && logChannel.isTextBased()) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Anti-Spam Triggered')
                            .setColor(Colors.Orange)
                            .setDescription(`Spam detected from ${message.author.tag}`)
                            .addFields(
                                { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                                { name: 'User', value: `<@${message.author.id}> (${message.author.id})`, inline: true },
                                { name: 'Message Count', value: `${antiSpam.userMessages.get(message.author.id)?.length || 0}`, inline: true }
                            )
                            .setTimestamp();
                            
                        logChannel.send({ embeds: [logEmbed] }).catch(err => console.error('Error sending spam log:', err));
                    }
                }
            }
        } catch (error) {
            console.error('Error in anti-spam handler:', error);
        }
    }
};