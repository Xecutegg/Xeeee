export default async (message, identifier) => {
    let entity = identifier.replace(/[<@&>]/g, '').trim();

    let role = message.guild.roles.cache.find(r => r.name === entity || r.id === entity);
    if (role) return role;

    let user = await message.guild.members.fetch(entity).catch(() => null);
    if (user) return user;

    user = message.guild.members.cache.find(m => m.user.username === entity || m.nickname === entity);
    if (user) return user;

    return null;
};
