export default {
    name: "checkAfk",
    isEvent: true,
    type: "messageCreate",
    async execute(client, message) {
        if (message.author.bot) return;
        if (message.mentions.members.size > 0) {
            const afkUsers = await client.db.Afk.find({
                userId: { $in: message.mentions.users.map(user => user.id) },
                guildId: message.guild.id,
            });
            afkUsers.forEach(afkUser => {
                message.reply(
                    `<@${afkUser.userId}> is currently AFK: ${afkUser.reason} - <t:${Math.round(afkUser.createdAt / 1000)}:R>`
                );
            });
        }

        const afkCheck = await client.db.Afk.findOneAndDelete({
            userId: message.author.id,
            guildId: message.guild.id,
        });
        if (afkCheck) {
            message.reply(`${message.author.tag} is no longer AFK.`);
        }

    }
}