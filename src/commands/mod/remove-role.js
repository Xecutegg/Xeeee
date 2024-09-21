import resolveUser from '../../utils/resolveUser.js';

export default {
    name: 'role-remove',
    description: 'Removes a role from specified users.',
    usage: '<@role> <@user1> [@user2 ...]',
    category: 'moderation',
    userperms: ['ManageRoles'],
    botperms: ['ManageRoles'],
    async execute(client, message, args) {
        if (!args[0]) return message.reply('Please mention a role to remove.');
        const roleMention = args[0];
        const role = message.mentions.roles.first() || message.guild.roles.cache.find(v => v.id === roleMention || v.name.toLowerCase() === roleMention.toLowerCase());
        if (!role) return message.reply('Could not find the specified role.');

        let success = [];
        let failed = [];

        for (const arg of args.slice(1)) {
            const user = await resolveUser(arg);
            if (!user) {
                failed.push(arg);
                continue;
            }

            const member = await message.guild.members.fetch(user.id).catch(() => null);
            if (!member) {
                failed.push(user.tag);
                continue;
            }

            if (!member.roles.cache.has(role.id)) {
                success.push(`${member.user.tag} does not have the role.`);
                continue;
            }

            try {
                await member.roles.remove(role);
                success.push(`Removed role from ${member.user.tag}.`);
            } catch (error) {
                failed.push(`${member.user.tag} could not be updated.`);
            }
        }

        let resultMessage = '';
        if (success.length > 0) resultMessage += `**Successfully removed role from:**\n${success.join('\n')}\n`;
        if (failed.length > 0) resultMessage += `**Failed to remove role from:**\n${failed.join('\n')}`;

        message.channel.send(resultMessage || 'No changes were made.');
    }
};
