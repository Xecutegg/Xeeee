import resolveRole from '../../utils/resolveRole.js';

export default {
    name: "role-remove-humans",
    description: "Removes a specified role from all human members in the server.",
    usage: "<role mention or role name>",
    category: "moderation",
    aliases: ["roleremovehumans", "rrole-humans"],
    userperms: ['ManageRoles'],
    botperms: ["ManageRoles"],
    async execute(client, message, args) {
        try {
            if (!args[0]) return message.reply("Please provide a role name or mention.");
            const role = await resolveRole(message, args[0]);
            if (!role || !role.id) return message.reply("Role not found. Please provide a valid role name or mention.");
            let passed = 0;
            let failed = 0;
            let humans = message.guild.members.cache.filter(member => !member.user.bot);

            for (const member of humans.values()) {
                try {
                    if (member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                        passed += 1;
                    }
                } catch (error) {
                    failed += 1;
                }
            }

            return message.reply(`Role successfully removed from ${passed} members. Failed to remove role for ${failed} members.`);
        } catch (error) {
            return message.reply('An error occurred while processing the command.');
        }
    }
};
