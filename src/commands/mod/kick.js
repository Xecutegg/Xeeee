import resolveUser from '../../utils/resolveUser.js'

export default {
    name: 'kick',
    description: 'Kicks a member from the server.',
    usage: '<@user> [reason]',
    category: 'moderation',
    userperms: ['KickMembers'],
    botperms: ['KickMembers'],
    async execute(client, message, args) {
        if (!message.member.permissions.has('KickMembers')) return message.reply("You don't have permission to use this command.");
        if (!message.guild.members.me.permissions.has('KickMembers')) return message.reply("I don't have permission to kick members.");
        if (!args[0]) return message.reply('Please mention a user to kick.');

        const user = await resolveUser(args[0]);
        if (!user) return message.reply('Could not find that user.');

        const reason = args.slice(1).join(' ') || `Action by ${message.author.tag}`;
        const member = await message.guild.members.fetch(user.id).catch(() => null);
        if (!member) return message.reply('That user is not in this server.');

        if (member.id === message.author.id) return message.reply('You cannot kick yourself.');
        if (message.member.roles.highest.comparePositionTo(member.roles.highest) < 1) {
            return message.reply('Your role is too low to kick this user.');
        }
        if (message.guild.members.me.roles.highest.comparePositionTo(member.roles.highest) < 1) {
            return message.reply(`My role must be higher than ${member.user.tag}'s highest role.`);
        }
        if (!member.kickable) return message.reply('That user cannot be kicked.');

        try {
            await member.kick(reason);
            message.channel.send(`${member.user.tag} has been kicked. Reason: ${reason}`);
        } catch (error) {
            console.error(`Error kicking user: ${error}`);
            message.reply('An error occurred while trying to kick the user.');
        }
    }
};
