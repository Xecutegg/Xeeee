import { PermissionFlagsBits, EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'antispam',
    description: 'Toggle or manage anti-spam protection for the server',
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
            await toggleAntiSpam(client, message, action === 'enable');
            return;
        } else if (action === 'status') {
            return showStatus(client, message);
        } else {
            // If invalid argument, show help
            const embed = new EmbedBuilder()
                .setTitle('Anti-Spam Command Help')
                .setColor(Colors.Blue)
                .setDescription('Quickly enable or disable anti-spam protection for your server.')
                .addFields(
                    { name: 'Usage', value: '`antispam enable` - Enable anti-spam protection\n`antispam disable` - Disable anti-spam protection\n`antispam status` - Check current status' },
                    { name: 'Configuration', value: 'For detailed configuration, use `antispam-config` command.' }
                )
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            
            message.reply({ embeds: [embed] });
        }
    }
};

// Show current status of anti-spam
async function showStatus(client, message) {
    try {
        const guildData = await client.db.Guild.findOne({ guildId: message.guild.id });
        const antiSpam = guildData?.antiSpam || {};
        
        const embed = new EmbedBuilder()
            .setTitle('Anti-Spam Protection Status')
            .setColor(antiSpam.enabled ? Colors.Green : Colors.Red)
            .setDescription(`Anti-spam protection is currently **${antiSpam.enabled ? 'ENABLED' : 'DISABLED'}**`)
            .addFields(
                { name: 'Threshold', value: `${antiSpam.threshold || 5} messages in ${antiSpam.time || 5000}ms`, inline: true },
                { name: 'Punishment', value: antiSpam.punishment || 'warn', inline: true },
                { name: 'Warning Threshold', value: `${antiSpam.warnThreshold || 3} violations`, inline: true },
                { name: 'Exempt Items', value: `${antiSpam.exemptUsers?.length || 0} users, ${antiSpam.exemptChannels?.length || 0} channels, ${antiSpam.exemptRoles?.length || 0} roles`, inline: true },
                { name: 'Log Channel', value: antiSpam.logChannel ? `<#${antiSpam.logChannel}>` : 'Not set', inline: true },
                { name: 'Configure', value: 'Use `antispam-config` for detailed settings' }
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            
        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error checking anti-spam status:', error);
        message.reply('An error occurred while checking anti-spam status.');
    }
}

// Enable or disable anti-spam
async function toggleAntiSpam(client, message, enable) {
    try {
        await client.db.Guild.updateOne(
            { guildId: message.guild.id },
            { $set: { 'antiSpam.enabled': enable } },
            { upsert: true }
        );
        
        const embed = new EmbedBuilder()
            .setTitle('Anti-Spam Protection')
            .setColor(enable ? Colors.Green : Colors.Red)
            .setDescription(`Anti-spam protection has been **${enable ? 'ENABLED' : 'DISABLED'}**`)
            .setFooter({ text: `Updated by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
        
        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error toggling anti-spam:', error);
        message.reply('An error occurred while updating anti-spam settings.');
    }
}