export default {
    name: 'unban',
    description: 'Unbans a member from the server.',
    usage: '<userID> [reason]',
    category: 'moderation',
    userperms: ['BanMembers'],
    botperms: ['BanMembers'],
    async execute(client, message, args) {
        if (!message.member.permissions.has('BanMembers')) return message.reply("You don't have permission to use this command.");
        if (!message.guild.members.me.permissions.has('BanMembers')) return message.reply("I don't have permission to unban members.");
        if (!args[0]) return message.reply('Please provide a user ID to unban.');

        const userID = args[0];
        const reason = args.slice(1).join(' ') || `Action by ${message.author.tag}`;

        try {
            const banList = await message.guild.bans.fetch();
            const bannedUser = banList.get(userID);

            if (!bannedUser) {
                return message.reply('That user is not banned.');
            }

            await message.guild.bans.remove(userID, reason);
            message.channel.send(`${bannedUser.user.tag} has been unbanned. Reason: ${reason}`);
        } catch (error) {
            console.error(`Error unbanning user: ${error}`);
            message.reply('An error occurred while trying to unban the user.');
        }
    }
};
