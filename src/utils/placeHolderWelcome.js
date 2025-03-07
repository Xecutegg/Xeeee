export function replacePlaceholders(template, member, guild) {
    return template
        .replace(/{member.name}/g, member.user.username)
        .replace(/{member.tag}/g, `${member.user.username}#${member.user.discriminator}`)
        .replace(/{member.id}/g, member.id)
        .replace(/{server.name}/g, guild.name)
        .replace(/{server.id}/g, guild.id)
        .replace(/{server.members}/g, guild.memberCount);
}