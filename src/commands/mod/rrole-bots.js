import resolveRole from '../../utils/resolveRole.js';

export default {
    name: "role-remove-bots",
    description: "Removes a specified role from all bot members in the server.",
    usage: "<role mention or role name>",
    category: "moderation",
    aliases: ["roleremovebots", "rrole-bots"],
    userperms: ['ManageRoles'],
    botperms: ["ManageRoles"],
    async execute(client, message, args) {
        try {
            if (!args[0]) return message.reply("Please provide a role name or mention.");

            const role = await resolveRole(message, args[0]);
            if (!role || !role.id) return message.reply("Role not found. Please provide a valid role name or mention.");

            let passed = 0;
            let failed = 0;
            let bots = message.guild.members.cache.filter(member => member.user.bot);

            for (const member of bots.values()) {
                try {
                    if (member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                        passed += 1;
                    }
                } catch (error) {
                    console.error(`Failed to remove role from ${member.user.tag}: ${error.message}`);
                    failed += 1;
                }
            }

            return message.reply(`Role successfully removed from ${passed} bots. Failed to remove role for ${failed} bots.`);
        } catch (error) {
            console.error(`Error executing role-remove-bots command: ${error.message}`);
            return message.reply('An error occurred while processing the command.');
        }
    }
};
