import resolveRole from '../../utils/resolveRole.js';

export default {
    name: "role-bots",
    description: "Adds a specified role to all bot members in the server.",
    usage: "<role mention or role name>",
    category: "moderation",
    aliases: ["roleaddbots"],
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
                    if (!member.roles.cache.has(role.id)) {
                        await member.roles.add(role);
                        passed += 1;
                    }
                } catch (error) {
                    failed += 1;
                }
            }

            return message.reply(`Role successfully added to ${passed} bots. Failed to add role for ${failed} bots.`);
        } catch (error) {
            return message.reply('An error occurred while processing the command.');
        }
    }
};
