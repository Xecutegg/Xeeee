import resolveUser from '../../utils/resolveUser.js';
import ms from 'ms'; // Import the ms library to handle time parsing

export default {
    name: 'timeout',
    description: 'Timeouts a member in the server for a specified duration or permanently.',
    usage: '<@user> [duration] [reason]',
    category: 'moderation',
    aliases: ['mute'],
    userperms: ['ModerateMembers'],
    botperms: ['ModerateMembers'],
    async execute(client, message, args) {
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply("You don't have permission to use this command.");
        }
        if (!message.guild.members.me.permissions.has('ModerateMembers')) {
            return message.reply("I don't have permission to timeout members.");
        }
        if (!args[0]) return message.reply('Please mention a user to timeout.');

        const user = await resolveUser(args[0]);
        if (!user) return message.reply('Could not find that user.');

        // Determine if a duration was provided
        let duration = args[1] ? ms(args[1]) : null;
        if (duration && (isNaN(duration) || duration < 10000 || duration > 2419200000)) {
            return message.reply('Please specify a valid duration between 10 seconds and 28 days.');
        }
        if (!duration) {
            duration = null; // Set to null for permanent timeout
        }

        const reason = duration ? args.slice(2).join(' ') : args.slice(1).join(' ') || 'No reason provided';
        const member = await message.guild.members.fetch(user.id).catch(() => null);
        if (!member) return message.reply('That user is not in this server.');

        if (member.id === message.author.id) return message.reply('You cannot timeout yourself.');
        if (message.member.roles.highest.comparePositionTo(member.roles.highest) < 1) {
            return message.reply('Your role is too low to timeout this user.');
        }
        if (message.guild.members.me.roles.highest.comparePositionTo(member.roles.highest) < 1) {
            return message.reply(`My role must be higher than ${member.user.tag}'s highest role.`);
        }
        if (!member.moderatable) return message.reply('That user cannot be timed out.');

        try {
            if (duration) {
                await member.timeout(duration, reason);
                message.channel.send(`${member.user.tag} has been timed out for ${ms(duration, { long: true })}. Reason: ${reason}`);
            } else {
                await member.timeout(2419200000, reason);
                message.channel.send(`${member.user.tag} has been permanently timed out. Reason: ${reason}`);
            }
        } catch (error) {
            console.error(`Error timing out user: ${error}`);
            message.reply('An error occurred while trying to timeout the user.');
        }
    }
};
