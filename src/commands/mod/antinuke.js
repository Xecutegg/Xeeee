import { PermissionFlagsBits, EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'antinuke',
    description: 'Toggle or manage anti-nuke protection for the server',
    usage: '<enable/disable> OR <status>',
    category: 'mod',
    userperms: [PermissionFlagsBits.Administrator],
    botperms: [PermissionFlagsBits.SendMessages],
    async execute(client, message, args) {
        // If no arguments provided, show current status
        if (!args.length) {
            return showStatus(client, message);
        }

        const action = args[0].toLowerCase();
        
        // Handle enable/disable commands
        if (action === 'enable' || action === 'disable') {
            await toggleAntiNuke(client, message, action === 'enable');
            return;
        } else if (action === 'status') {
            return showStatus(client, message);
        } else {
            // If invalid argument, show help
            const embed = new EmbedBuilder()
                .setTitle('Anti-Nuke Command Help')
                .setColor(Colors.Blue)
                .setDescription('Quickly enable or disable anti-nuke protection for your server.')
                .addFields(
                    { name: 'Usage', value: '`antinuke enable` - Enable anti-nuke protection\n`antinuke disable` - Disable anti-nuke protection\n`antinuke status` - Check current status' },
                    { name: 'Configuration', value: 'For detailed configuration, use `antinuke-config` command.' }
                )
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            
            message.reply({ embeds: [embed] });
        }
    }
};

// Show current status of anti-nuke
async function showStatus(client, message) {
    try {
        const guildData = await client.db.Guild.findOne({ guildId: message.guild.id });
        const antiNuke = guildData?.antiNuke || {};
        
        const embed = new EmbedBuilder()
            .setTitle('Anti-Nuke Protection Status')
            .setColor(antiNuke.enabled ? Colors.Green : Colors.Red)
            .setDescription(`Anti-nuke protection is currently **${antiNuke.enabled ? 'ENABLED' : 'DISABLED'}**`)
            .addFields(
                { name: 'Punishment Method', value: antiNuke.punishment || 'removePerms', inline: true },
                { name: 'Trusted Users', value: `${antiNuke.trustedUsers?.length || 0} users`, inline: true },
                { name: 'Whitelisted Roles', value: `${antiNuke.whitelistedRoles?.length || 0} roles`, inline: true },
                { name: 'Log Channel', value: antiNuke.logChannel ? `<#${antiNuke.logChannel}>` : 'Not set', inline: true },
                { name: 'Configure', value: 'Use `antinuke-config` for detailed settings' }
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            
        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error checking anti-nuke status:', error);
        message.reply('An error occurred while checking anti-nuke status.');
    }
}

// Enable or disable anti-nuke
async function toggleAntiNuke(client, message, enable) {
    try {
        await client.db.Guild.updateOne(
            { guildId: message.guild.id },
            { $set: { 'antiNuke.enabled': enable } },
            { upsert: true }
        );
        
        const embed = new EmbedBuilder()
            .setTitle('Anti-Nuke Protection')
            .setColor(enable ? Colors.Green : Colors.Red)
            .setDescription(`Anti-nuke protection has been **${enable ? 'ENABLED' : 'DISABLED'}**`)
            .setFooter({ text: `Updated by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
        
        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error toggling anti-nuke:', error);
        message.reply('An error occurred while updating anti-nuke settings.');
    }
}