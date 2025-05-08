import { EmbedBuilder, Colors, PermissionFlagsBits } from 'discord.js';
import resolveChannel from '../../utils/resolveChannel.js';
import resolveRole from '../../utils/resolveRole.js';
import resolveUser from '../../utils/resolveUser.js';

export default {
    name: "antispam-config",
    aliases: ["as-config", "spamconfig", "noraid"],
    description: "Configure the anti-spam protection system for your server",
    usage: "<enable/disable> OR <setting> <value>",
    category: "mod",
    userperms: [PermissionFlagsBits.Administrator],
    botperms: [PermissionFlagsBits.SendMessages],
    async execute(client, message, args) {
        if (!args.length) {
            return showCurrentConfig(client, message);
        }

        const action = args[0].toLowerCase();
        
        // Enable/disable the anti-spam system
        if (action === 'enable' || action === 'disable') {
            await toggleAntiSpam(client, message, action === 'enable');
            return;
        }

        // Handle other configuration options
        const setting = action;
        const value = args.slice(1).join(' ');
        
        if (!value && !['exemptions', 'channels', 'roles'].includes(setting)) {
            return message.reply('You need to provide a value for the setting.');
        }

        switch (setting) {
            case 'punishment':
                await updatePunishment(client, message, args[1], args.slice(2).join(' '));
                break;
                
            case 'logchannel':
                await setLogChannel(client, message, value);
                break;
                
            case 'threshold':
                if (args.length < 3) {
                    return message.reply('Usage: `antispam-config threshold <count> <timeMs>`');
                }
                await updateThreshold(client, message, args[1], args[2]);
                break;
                
            case 'warn':
                await updateWarnThreshold(client, message, value);
                break;
                
            case 'exempt-add':
            case 'exempt-remove':
                await updateExemptUser(client, message, setting === 'exempt-add', value);
                break;
                
            case 'exemptions':
                await listExemptUsers(client, message);
                break;
                
            case 'channel-exempt-add':
            case 'channel-exempt-remove':
                await updateExemptChannel(client, message, setting === 'channel-exempt-add', value);
                break;
                
            case 'channels':
                await listExemptChannels(client, message);
                break;
                
            case 'role-exempt-add':
            case 'role-exempt-remove':
                await updateExemptRole(client, message, setting === 'role-exempt-add', value);
                break;
                
            case 'roles':
                await listExemptRoles(client, message);
                break;
                
            default:
                const helpEmbed = new EmbedBuilder()
                    .setTitle('Anti-Spam Configuration Help')
                    .setColor(Colors.Blue)
                    .setDescription('Anti-spam protection prevents message spam and rapid mentions that can disrupt your server.')
                    .addFields(
                        { name: 'Enable/Disable', value: '`antispam-config enable` / `antispam-config disable`' },
                        { name: 'Punishment', value: '`antispam-config punishment <warn/mute/kick/ban> [duration]` - Action for spam violations' },
                        { name: 'Threshold', value: '`antispam-config threshold <messageCount> <timeMs>` - Set spam trigger thresholds' },
                        { name: 'Warning Threshold', value: '`antispam-config warn <count>` - Number of violations before punishment' },
                        { name: 'User Exemptions', value: '`antispam-config exempt-add <user>` - Exempt a user\n`antispam-config exempt-remove <user>` - Remove exemption\n`antispam-config exemptions` - List exempt users' },
                        { name: 'Channel Exemptions', value: '`antispam-config channel-exempt-add <channel>` - Exempt a channel\n`antispam-config channel-exempt-remove <channel>` - Remove channel exemption\n`antispam-config channels` - List exempt channels' },
                        { name: 'Role Exemptions', value: '`antispam-config role-exempt-add <role>` - Exempt a role\n`antispam-config role-exempt-remove <role>` - Remove role exemption\n`antispam-config roles` - List exempt roles' },
                        { name: 'Log Channel', value: '`antispam-config logchannel <channel/none>` - Set anti-spam log channel' }
                    )
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
                
                message.reply({ embeds: [helpEmbed] });
        }
    }
};

// Show current anti-spam configuration
async function showCurrentConfig(client, message) {
    try {
        const guildData = await client.db.Guild.findOne({ guildId: message.guild.id });
        const antiSpam = guildData?.antiSpam || {};
        
        const embed = new EmbedBuilder()
            .setTitle('Anti-Spam Configuration')
            .setColor(antiSpam.enabled ? Colors.Green : Colors.Red)
            .setDescription('Anti-spam protection prevents message spam and rapid mentions that can disrupt your server.')
            .addFields(
                { name: 'Status', value: antiSpam.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
                { name: 'Punishment', value: `${antiSpam.punishment || 'warn'}${antiSpam.punishmentDuration ? ` (${antiSpam.punishmentDuration}ms)` : ''}`, inline: true },
                { name: 'Warning Threshold', value: `${antiSpam.warnThreshold || 3} violations`, inline: true },
                { name: 'Message Threshold', value: antiSpam.threshold ? `${antiSpam.threshold} messages in ${antiSpam.time || 5000}ms` : '5 messages in 5000ms (default)', inline: true },
                { name: 'Log Channel', value: antiSpam.logChannel ? `<#${antiSpam.logChannel}>` : 'Not set', inline: true }
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            
        // Add exempted users
        if (antiSpam.exemptUsers && antiSpam.exemptUsers.length > 0) {
            const exemptedUsersText = antiSpam.exemptUsers.map(id => `<@${id}>`).join(', ');
            embed.addFields({ 
                name: 'Exempt Users', 
                value: exemptedUsersText.length > 1024 ? 
                    `${antiSpam.exemptUsers.length} users are exempt (too many to display)` : 
                    exemptedUsersText
            });
        }
        
        // Add exempted channels
        if (antiSpam.exemptChannels && antiSpam.exemptChannels.length > 0) {
            const exemptedChannelsText = antiSpam.exemptChannels.map(id => `<#${id}>`).join(', ');
            embed.addFields({ 
                name: 'Exempt Channels', 
                value: exemptedChannelsText.length > 1024 ? 
                    `${antiSpam.exemptChannels.length} channels are exempt (too many to display)` : 
                    exemptedChannelsText
            });
        }
        
        // Add exempted roles
        if (antiSpam.exemptRoles && antiSpam.exemptRoles.length > 0) {
            const exemptedRolesText = antiSpam.exemptRoles.map(id => `<@&${id}>`).join(', ');
            embed.addFields({ 
                name: 'Exempt Roles', 
                value: exemptedRolesText.length > 1024 ? 
                    `${antiSpam.exemptRoles.length} roles are exempt (too many to display)` : 
                    exemptedRolesText
            });
        }
        
        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error displaying anti-spam config:', error);
        message.reply('An error occurred while fetching the configuration.');
    }
}

// Enable or disable the anti-spam system
async function toggleAntiSpam(client, message, enable) {
    try {
        await client.db.Guild.updateOne(
            { guildId: message.guild.id },
            { $set: { 'antiSpam.enabled': enable } },
            { upsert: true }
        );
        
        const embed = new EmbedBuilder()
            .setTitle('Anti-Spam System')
            .setColor(enable ? Colors.Green : Colors.Red)
            .setDescription(`Anti-spam protection system has been **${enable ? 'enabled' : 'disabled'}**`)
            .setFooter({ text: `Updated by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
        
        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error toggling anti-spam:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}

// Update punishment method
async function updatePunishment(client, message, punishment, duration) {
    const validPunishments = ['warn', 'mute', 'kick', 'ban'];
    
    if (!validPunishments.includes(punishment.toLowerCase())) {
        return message.reply(`Invalid punishment type. Please use one of: ${validPunishments.join(', ')}`);
    }
    
    let punishmentDuration = null;
    if (duration) {
        // Try to parse duration string like "5m", "1h", "1d"
        const match = duration.match(/^(\d+)([smhdw])$/);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];
            
            // Convert to milliseconds
            switch (unit) {
                case 's': punishmentDuration = value * 1000; break;
                case 'm': punishmentDuration = value * 60 * 1000; break;
                case 'h': punishmentDuration = value * 60 * 60 * 1000; break;
                case 'd': punishmentDuration = value * 24 * 60 * 60 * 1000; break;
                case 'w': punishmentDuration = value * 7 * 24 * 60 * 60 * 1000; break;
            }
        } else if (!isNaN(parseInt(duration))) {
            // If just a number, assume minutes
            punishmentDuration = parseInt(duration) * 60 * 1000;
        }
    }
    
    try {
        const updateData = { 'antiSpam.punishment': punishment.toLowerCase() };
        if (punishmentDuration !== null) {
            updateData['antiSpam.punishmentDuration'] = punishmentDuration;
        }
        
        await client.db.Guild.updateOne(
            { guildId: message.guild.id },
            { $set: updateData },
            { upsert: true }
        );
        
        let response = `✅ Anti-spam punishment has been set to: ${punishment.toLowerCase()}`;
        if (punishmentDuration !== null) {
            response += ` with duration: ${duration} (${punishmentDuration}ms)`;
        }
        
        message.reply(response);
    } catch (error) {
        console.error('Error updating punishment:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}

// Update threshold values
async function updateThreshold(client, message, count, time) {
    const messageCount = parseInt(count);
    if (isNaN(messageCount) || messageCount < 2) {
        return message.reply('Message count must be a number greater than 1.');
    }
    
    const timeMs = parseInt(time);
    if (isNaN(timeMs) || timeMs < 1000) {
        return message.reply('Time must be at least 1000ms (1 second).');
    }
    
    try {
        await client.db.Guild.updateOne(
            { guildId: message.guild.id },
            { 
                $set: { 
                    'antiSpam.threshold': messageCount,
                    'antiSpam.time': timeMs 
                }
            },
            { upsert: true }
        );
        
        message.reply(`✅ Updated anti-spam threshold: ${messageCount} messages in ${timeMs}ms will trigger anti-spam measures.`);
    } catch (error) {
        console.error('Error updating threshold:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}

// Update warning threshold
async function updateWarnThreshold(client, message, value) {
    const warnCount = parseInt(value);
    
    if (isNaN(warnCount) || warnCount < 1) {
        return message.reply('Warning threshold must be a positive number.');
    }
    
    try {
        await client.db.Guild.updateOne(
            { guildId: message.guild.id },
            { $set: { 'antiSpam.warnThreshold': warnCount } },
            { upsert: true }
        );
        
        message.reply(`✅ Anti-spam warning threshold has been set to: ${warnCount} violations`);
    } catch (error) {
        console.error('Error updating warning threshold:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}

// Update exempt users
async function updateExemptUser(client, message, isAdding, value) {
    try {
        const user = await resolveUser(value);
        if (!user) {
            return message.reply('Could not find that user.');
        }
        
        if (isAdding) {
            // Add user to exempt list
            await client.db.Guild.updateOne(
                { guildId: message.guild.id },
                { $addToSet: { 'antiSpam.exemptUsers': user.id } },
                { upsert: true }
            );
            
            message.reply(`✅ ${user.tag} has been exempted from anti-spam detection.`);
        } else {
            // Remove user from exempt list
            await client.db.Guild.updateOne(
                { guildId: message.guild.id },
                { $pull: { 'antiSpam.exemptUsers': user.id } }
            );
            
            message.reply(`✅ ${user.tag} has been removed from anti-spam exemptions.`);
        }
    } catch (error) {
        console.error('Error updating exempt users:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}

// List exempt users
async function listExemptUsers(client, message) {
    try {
        const guildData = await client.db.Guild.findOne({ guildId: message.guild.id });
        const exemptUsers = guildData?.antiSpam?.exemptUsers || [];
        
        if (exemptUsers.length === 0) {
            return message.reply('There are no users exempted from anti-spam detection.');
        }
        
        const embed = new EmbedBuilder()
            .setTitle('Anti-Spam Exempt Users')
            .setColor(Colors.Blue)
            .setDescription('The following users are exempt from anti-spam detection:')
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            
        // Split into chunks to avoid field limit
        const mentions = exemptUsers.map(id => `<@${id}> (${id})`);
        for (let i = 0; i < mentions.length; i += 10) {
            const chunk = mentions.slice(i, i + 10);
            embed.addFields({ name: `Exempt Users ${i/10 + 1}`, value: chunk.join('\n') });
        }
        
        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error listing exempt users:', error);
        message.reply('An error occurred while fetching the exempt users.');
    }
}

// Update exempt channels
async function updateExemptChannel(client, message, isAdding, value) {
    try {
        const channel = await resolveChannel(message, value);
        if (!channel) {
            return message.reply('Could not find that channel.');
        }
        
        if (isAdding) {
            // Add channel to exempt list
            await client.db.Guild.updateOne(
                { guildId: message.guild.id },
                { $addToSet: { 'antiSpam.exemptChannels': channel.id } },
                { upsert: true }
            );
            
            message.reply(`✅ Channel ${channel} has been exempted from anti-spam detection.`);
        } else {
            // Remove channel from exempt list
            await client.db.Guild.updateOne(
                { guildId: message.guild.id },
                { $pull: { 'antiSpam.exemptChannels': channel.id } }
            );
            
            message.reply(`✅ Channel ${channel} has been removed from anti-spam exemptions.`);
        }
    } catch (error) {
        console.error('Error updating exempt channels:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}

// List exempt channels
async function listExemptChannels(client, message) {
    try {
        const guildData = await client.db.Guild.findOne({ guildId: message.guild.id });
        const exemptChannels = guildData?.antiSpam?.exemptChannels || [];
        
        if (exemptChannels.length === 0) {
            return message.reply('There are no channels exempted from anti-spam detection.');
        }
        
        const embed = new EmbedBuilder()
            .setTitle('Anti-Spam Exempt Channels')
            .setColor(Colors.Blue)
            .setDescription('The following channels are exempt from anti-spam detection:')
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            
        // Split into chunks to avoid field limit
        const mentions = exemptChannels.map(id => `<#${id}> (${id})`);
        for (let i = 0; i < mentions.length; i += 10) {
            const chunk = mentions.slice(i, i + 10);
            embed.addFields({ name: `Exempt Channels ${i/10 + 1}`, value: chunk.join('\n') });
        }
        
        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error listing exempt channels:', error);
        message.reply('An error occurred while fetching the exempt channels.');
    }
}

// Update exempt roles
async function updateExemptRole(client, message, isAdding, value) {
    try {
        const role = await resolveRole(message, value);
        if (!role) {
            return message.reply('Could not find that role.');
        }
        
        if (isAdding) {
            // Add role to exempt list
            await client.db.Guild.updateOne(
                { guildId: message.guild.id },
                { $addToSet: { 'antiSpam.exemptRoles': role.id } },
                { upsert: true }
            );
            
            message.reply(`✅ Role **${role.name}** has been exempted from anti-spam detection.`);
        } else {
            // Remove role from exempt list
            await client.db.Guild.updateOne(
                { guildId: message.guild.id },
                { $pull: { 'antiSpam.exemptRoles': role.id } }
            );
            
            message.reply(`✅ Role **${role.name}** has been removed from anti-spam exemptions.`);
        }
    } catch (error) {
        console.error('Error updating exempt roles:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}

// List exempt roles
async function listExemptRoles(client, message) {
    try {
        const guildData = await client.db.Guild.findOne({ guildId: message.guild.id });
        const exemptRoles = guildData?.antiSpam?.exemptRoles || [];
        
        if (exemptRoles.length === 0) {
            return message.reply('There are no roles exempted from anti-spam detection.');
        }
        
        const embed = new EmbedBuilder()
            .setTitle('Anti-Spam Exempt Roles')
            .setColor(Colors.Blue)
            .setDescription('Users with these roles are exempt from anti-spam detection:')
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            
        // Split into chunks to avoid field limit
        const mentions = exemptRoles.map(id => `<@&${id}> (${id})`);
        for (let i = 0; i < mentions.length; i += 10) {
            const chunk = mentions.slice(i, i + 10);
            embed.addFields({ name: `Exempt Roles ${i/10 + 1}`, value: chunk.join('\n') });
        }
        
        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error listing exempt roles:', error);
        message.reply('An error occurred while fetching the exempt roles.');
    }
}

// Set the log channel for anti-spam events
async function setLogChannel(client, message, value) {
    try {
        if (value.toLowerCase() === 'none') {
            await client.db.Guild.updateOne(
                { guildId: message.guild.id },
                { $set: { 'antiSpam.logChannel': null } }
            );
            
            return message.reply('✅ Anti-spam log channel has been removed.');
        }
        
        const channel = await resolveChannel(message, value);
        if (!channel) {
            return message.reply('Could not find that channel.');
        }
        
        if (!channel.isTextBased()) {
            return message.reply('The log channel must be a text channel.');
        }
        
        await client.db.Guild.updateOne(
            { guildId: message.guild.id },
            { $set: { 'antiSpam.logChannel': channel.id } },
            { upsert: true }
        );
        
        message.reply(`✅ Anti-spam log channel has been set to ${channel}.`);
    } catch (error) {
        console.error('Error setting log channel:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}