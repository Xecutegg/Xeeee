export default async function resolveRole(message, role) {
    let r = role.replace(/[<@&>]/g, '');
    let resolvedRole = null;
    try {
        if (!isNaN(Number(r))) {
            resolvedRole = await message.guild.roles.fetch(r).catch(() => null);
        } 
        else if (typeof r === 'string') {
            resolvedRole = message.guild.roles.cache.find(role => 
                role.id === r || role.name.toLowerCase() === r.toLowerCase()
            );
        }
    } catch (error) {
        throw new Error(error.message);
    }
    return resolvedRole;
}
