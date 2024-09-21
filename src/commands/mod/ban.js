import resolveUser from '../../utils/resolveUser.js'

export default {
    name: 'ban',
    description: 'Bans a member from the server.',
    usage: '<@user> [reason]',
    category: 'moderation',
    userperms: ['BanMembers'],
    botperms: ['BanMembers'],
    async execute(client, message, args) {
        if (!message.member.permissions.has('BanMembers')) return message.reply("You don't have permission to use this command.");
        if (!message.guild.members.me.permissions.has('BanMembers')) return message.reply("I don't have permission to ban members.");
        if (!args[0]) return message.reply('Please mention a user to ban.');

        const user = await resolveUser(args[0]);
        if (!user) return message.reply('Could not find that user.');

        const reason = args.slice(1).join(' ') || `Action by ${message.author.tag}`;
        const member = await message.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            try {
                await message.guild.bans.create(user.id, { reason });
                return message.channel.send(`${user.tag} has been banned. Reason: ${reason}`);
            } catch (error) {
                console.error(`Error banning user: ${error}`);
                return message.reply('An error occurred while trying to ban the user.');
            }
        }

        if (member.id === message.author.id) return message.reply('You cannot ban yourself.');
        if (message.member.roles.highest.comparePositionTo(member.roles.highest) < 1) {
            return message.reply(`Your role is too low to ban this user.`);
        }
        if (message.guild.members.me.roles.highest.comparePositionTo(member.roles.highest) < 1) {
            return message.reply(`My role must be higher than ${member.user.tag}'s highest role.`);
        }
        if (!member.bannable) return message.reply('That user cannot be banned.');

        try {
            await member.ban({ reason });
            message.channel.send(`${member.user.tag} has been banned. Reason: ${reason}`);
        } catch (error) {
            console.error(`Error banning user: ${error}`);
            message.reply('An error occurred while trying to ban the user.');
        }
    }
};
