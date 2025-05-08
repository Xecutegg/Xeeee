import { EmbedBuilder, Colors, PermissionFlagsBits } from 'discord.js';
import resolveChannel from '../../utils/resolveChannel.js';
import resolveRole from '../../utils/resolveRole.js';
import resolveUser from '../../utils/resolveUser.js';

export default {
    name: "antinuke-config",
    aliases: ["an-config", "nukeconfig"],
    description: "Configure the anti-nuke protection system for your server",
    usage: "<enable/disable> OR <setting> <value>",
    category: "mod",
    userperms: [PermissionFlagsBits.Administrator],
    botperms: [PermissionFlagsBits.SendMessages],
    async execute(client, message, args) {
        if (!args.length) {
            return showCurrentConfig(client, message);
        }

        const action = args[0].toLowerCase();
        
        // Enable/disable the anti-nuke system
        if (action === 'enable' || action === 'disable') {
            await toggleAntiNuke(client, message, action === 'enable');
            return;
        }

        // Handle other configuration options
        const setting = action;
        const value = args.slice(1).join(' ');
        
        if (!value && !['trusted', 'whitelist'].includes(setting)) {
            return message.reply('You need to provide a value for the setting.');
        }

        switch (setting) {
            case 'punishment':
                await updatePunishment(client, message, value);
                break;
                
            case 'logchannel':
                await setLogChannel(client, message, value);
                break;
                
            case 'threshold':
                if (args.length < 3) {
                    return message.reply('Usage: `antinuke-config threshold <action> <limit> [time]`\nActions: channelDelete, roleDelete, memberBan, memberKick, botAdd');
                }
                await updateThreshold(client, message, args[1], args[2], args[3]);
                break;
                
            case 'trust':
            case 'untrust':
                await updateTrustedUser(client, message, setting === 'trust', value);
                break;
                
            case 'trusted':
                await listTrustedUsers(client, message);
                break;
                
            case 'whitelist':
                await listWhitelistedRoles(client, message);
                break;
                
            case 'whitelist-add':
            case 'whitelist-remove':
                await updateWhitelistedRole(client, message, setting === 'whitelist-add', value);
                break;
                
            default:
                const helpEmbed = new EmbedBuilder()
                    .setTitle('Anti-Nuke Configuration Help')
                    .setColor(Colors.Blue)
                    .setDescription('Anti-nuke protection prevents rapid destructive actions like mass channel/role deletions, mass bans, and suspicious bot additions.')
                    .addFields(
                        { name: 'Enable/Disable', value: '`antinuke-config enable` / `antinuke-config disable`' },
                        { name: 'Punishment', value: '`antinuke-config punishment <ban/kick/removePerms>` - Action to take against nukers' },
                        { name: 'Thresholds', value: '`antinuke-config threshold <action> <limit> [timeMs]` - Set trigger thresholds' },
                        { name: '↳ Actions', value: 'channelDelete, roleDelete, memberBan, memberKick, botAdd' },
                        { name: 'Trust Management', value: '`antinuke-config trust <user>` - Add trusted user\n`antinuke-config untrust <user>` - Remove trusted user\n`antinuke-config trusted` - List trusted users' },
                        { name: 'Role Whitelist', value: '`antinuke-config whitelist-add <role>` - Add whitelisted role\n`antinuke-config whitelist-remove <role>` - Remove whitelisted role\n`antinuke-config whitelist` - List whitelisted roles' },
                        { name: 'Log Channel', value: '`antinuke-config logchannel <channel/none>` - Set anti-nuke log channel' }
                    )
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
                
                message.reply({ embeds: [helpEmbed] });
        }
    }
};

// Show current anti-nuke configuration
async function showCurrentConfig(client, message) {
    try {
        const guildData = await client.db.Guild.findOne({ guildId: message.guild.id });
        const antiNuke = guildData?.antiNuke || {};
        
        const embed = new EmbedBuilder()
            .setTitle('Anti-Nuke Configuration')
            .setColor(antiNuke.enabled ? Colors.Green : Colors.Red)
            .setDescription('Anti-nuke protection prevents rapid destructive actions like mass channel deletions, role deletions, mass bans, and suspicious bot additions.')
            .addFields(
                { name: 'Status', value: antiNuke.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
                { name: 'Punishment', value: antiNuke.punishment || 'removePerms', inline: true },
                { name: 'Log Channel', value: antiNuke.logChannel ? `<#${antiNuke.logChannel}>` : 'Not set', inline: true }
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            
        // Add thresholds
        if (antiNuke.thresholds) {
            const thresholds = antiNuke.thresholds;
            const thresholdsText = [];
            
            if (thresholds.channelDelete) {
                thresholdsText.push(`Channel Delete: ${thresholds.channelDelete.limit} in ${thresholds.channelDelete.time}ms`);
            }
            if (thresholds.roleDelete) {
                thresholdsText.push(`Role Delete: ${thresholds.roleDelete.limit} in ${thresholds.roleDelete.time}ms`);
            }
            if (thresholds.memberBan) {
                thresholdsText.push(`Member Ban: ${thresholds.memberBan.limit} in ${thresholds.memberBan.time}ms`);
            }
            if (thresholds.memberKick) {
                thresholdsText.push(`Member Kick: ${thresholds.memberKick.limit} in ${thresholds.memberKick.time}ms`);
            }
            if (thresholds.botAdd) {
                thresholdsText.push(`Bot Add: ${thresholds.botAdd.limit} in ${thresholds.botAdd.time}ms`);
            }
            
            embed.addFields({ 
                name: 'Thresholds', 
                value: thresholdsText.length > 0 ? thresholdsText.join('\n') : 'Using default thresholds' 
            });
        }
        
        // Add trusted users
        if (antiNuke.trustedUsers && antiNuke.trustedUsers.length > 0) {
            const trustedUsers = [];
            for (const userId of antiNuke.trustedUsers) {
                trustedUsers.push(`<@${userId}>`);
            }
            embed.addFields({ 
                name: 'Trusted Users', 
                value: trustedUsers.join(', ') 
            });
        }
        
        // Add whitelisted roles
        if (antiNuke.whitelistedRoles && antiNuke.whitelistedRoles.length > 0) {
            const whitelistedRoles = [];
            for (const roleId of antiNuke.whitelistedRoles) {
                whitelistedRoles.push(`<@&${roleId}>`);
            }
            embed.addFields({ 
                name: 'Whitelisted Roles', 
                value: whitelistedRoles.join(', ') 
            });
        }
        
        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error displaying anti-nuke config:', error);
        message.reply('An error occurred while fetching the configuration.');
    }
}

// Enable or disable the anti-nuke system
async function toggleAntiNuke(client, message, enable) {
    try {
        await client.db.Guild.updateOne(
            { guildId: message.guild.id },
            { $set: { 'antiNuke.enabled': enable } },
            { upsert: true }
        );
        
        const embed = new EmbedBuilder()
            .setTitle('Anti-Nuke System')
            .setColor(enable ? Colors.Green : Colors.Red)
            .setDescription(`Anti-nuke protection system has been **${enable ? 'enabled' : 'disabled'}**`)
            .setFooter({ text: `Updated by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
        
        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error toggling anti-nuke:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}

// Update punishment method
async function updatePunishment(client, message, value) {
    const validPunishments = ['ban', 'kick', 'removePerms'];
    
    if (!validPunishments.includes(value.toLowerCase())) {
        return message.reply(`Invalid punishment type. Please use one of: ${validPunishments.join(', ')}`);
    }
    
    try {
        await client.db.Guild.updateOne(
            { guildId: message.guild.id },
            { $set: { 'antiNuke.punishment': value.toLowerCase() } },
            { upsert: true }
        );
        
        message.reply(`✅ Anti-nuke punishment has been set to: ${value.toLowerCase()}`);
    } catch (error) {
        console.error('Error updating punishment:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}

// Update threshold values
async function updateThreshold(client, message, action, limit, timeMs) {
    const validActions = ['channelDelete', 'roleDelete', 'memberBan', 'memberKick', 'botAdd'];
    
    if (!validActions.includes(action)) {
        return message.reply(`Invalid action type. Please use one of: ${validActions.join(', ')}`);
    }
    
    const limitValue = parseInt(limit);
    if (isNaN(limitValue) || limitValue < 1) {
        return message.reply('Limit must be a positive number.');
    }
    
    // Default time if not provided
    let timeValue = parseInt(timeMs);
    if (isNaN(timeValue) || timeValue < 1000) {
        if (action === 'botAdd') {
            timeValue = 30000; // 30 seconds for bot additions
        } else {
            timeValue = 10000; // 10 seconds default for other actions
        }
    }
    
    try {
        const updatePath = `antiNuke.thresholds.${action}`;
        await client.db.Guild.updateOne(
            { guildId: message.guild.id },
            { $set: { 
                [`${updatePath}.limit`]: limitValue,
                [`${updatePath}.time`]: timeValue
            }},
            { upsert: true }
        );
        
        message.reply(`✅ Updated threshold for **${action}**: ${limitValue} actions in ${timeValue}ms will trigger anti-nuke`);
    } catch (error) {
        console.error('Error updating threshold:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}

// Update trusted users
async function updateTrustedUser(client, message, isAdding, value) {
    try {
        const user = await resolveUser(value);
        if (!user) {
            return message.reply('Could not find that user.');
        }
        
        if (isAdding) {
            // Add user to trusted list
            await client.db.Guild.updateOne(
                { guildId: message.guild.id },
                { $addToSet: { 'antiNuke.trustedUsers': user.id } },
                { upsert: true }
            );
            
            message.reply(`✅ ${user.tag} has been added to the anti-nuke trusted users list.`);
        } else {
            // Remove user from trusted list
            await client.db.Guild.updateOne(
                { guildId: message.guild.id },
                { $pull: { 'antiNuke.trustedUsers': user.id } }
            );
            
            message.reply(`✅ ${user.tag} has been removed from the anti-nuke trusted users list.`);
        }
    } catch (error) {
        console.error('Error updating trusted users:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}

// List trusted users
async function listTrustedUsers(client, message) {
    try {
        const guildData = await client.db.Guild.findOne({ guildId: message.guild.id });
        const trustedUsers = guildData?.antiNuke?.trustedUsers || [];
        
        if (trustedUsers.length === 0) {
            return message.reply('There are no trusted users configured for anti-nuke protection.');
        }
        
        const embed = new EmbedBuilder()
            .setTitle('Anti-Nuke Trusted Users')
            .setColor(Colors.Blue)
            .setDescription('The following users are trusted and exempt from anti-nuke detection:')
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            
        // Split into chunks to avoid field limit
        const mentions = trustedUsers.map(id => `<@${id}> (${id})`);
        for (let i = 0; i < mentions.length; i += 10) {
            const chunk = mentions.slice(i, i + 10);
            embed.addFields({ name: `Trusted Users ${i/10 + 1}`, value: chunk.join('\n') });
        }
        
        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error listing trusted users:', error);
        message.reply('An error occurred while fetching the trusted users.');
    }
}

// List whitelisted roles
async function listWhitelistedRoles(client, message) {
    try {
        const guildData = await client.db.Guild.findOne({ guildId: message.guild.id });
        const whitelistedRoles = guildData?.antiNuke?.whitelistedRoles || [];
        
        if (whitelistedRoles.length === 0) {
            return message.reply('There are no whitelisted roles configured for anti-nuke protection.');
        }
        
        const embed = new EmbedBuilder()
            .setTitle('Anti-Nuke Whitelisted Roles')
            .setColor(Colors.Blue)
            .setDescription('Users with these roles are exempt from anti-nuke detection:')
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            
        // Split into chunks to avoid field limit
        const mentions = whitelistedRoles.map(id => `<@&${id}> (${id})`);
        for (let i = 0; i < mentions.length; i += 10) {
            const chunk = mentions.slice(i, i + 10);
            embed.addFields({ name: `Whitelisted Roles ${i/10 + 1}`, value: chunk.join('\n') });
        }
        
        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error listing whitelisted roles:', error);
        message.reply('An error occurred while fetching the whitelisted roles.');
    }
}

// Update whitelisted roles
async function updateWhitelistedRole(client, message, isAdding, value) {
    try {
        const role = await resolveRole(message, value);
        if (!role) {
            return message.reply('Could not find that role.');
        }
        
        if (isAdding) {
            // Add role to whitelist
            await client.db.Guild.updateOne(
                { guildId: message.guild.id },
                { $addToSet: { 'antiNuke.whitelistedRoles': role.id } },
                { upsert: true }
            );
            
            message.reply(`✅ Role **${role.name}** has been added to the anti-nuke whitelist.`);
        } else {
            // Remove role from whitelist
            await client.db.Guild.updateOne(
                { guildId: message.guild.id },
                { $pull: { 'antiNuke.whitelistedRoles': role.id } }
            );
            
            message.reply(`✅ Role **${role.name}** has been removed from the anti-nuke whitelist.`);
        }
    } catch (error) {
        console.error('Error updating whitelisted roles:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}

// Set the log channel for anti-nuke events
async function setLogChannel(client, message, value) {
    try {
        if (value.toLowerCase() === 'none') {
            await client.db.Guild.updateOne(
                { guildId: message.guild.id },
                { $set: { 'antiNuke.logChannel': null } }
            );
            
            return message.reply('✅ Anti-nuke log channel has been removed.');
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
            { $set: { 'antiNuke.logChannel': channel.id } },
            { upsert: true }
        );
        
        message.reply(`✅ Anti-nuke log channel has been set to ${channel}.`);
    } catch (error) {
        console.error('Error setting log channel:', error);
        message.reply('An error occurred while updating the configuration.');
    }
}