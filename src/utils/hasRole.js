export async function checkUserRoleInGuild(client, guildId, roleId, userId) {
    try {
        const guild = await client.guilds.fetch(guildId);
        const role = await guild.roles.fetch(roleId);
        if (!role) return false;

        const user = await guild.members.fetch(userId).catch(() => null);
        if (!user) {
            return false;
        }

        const hasRole = user.roles.cache.has(role.id);
        return hasRole;
    } catch (error) {
        return false;
    }
}
