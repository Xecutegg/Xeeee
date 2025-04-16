export default {
    name: "checkAfk",
    isEvent: true,
    type: "messageCreate",
    async execute(client, message) {
        if (!message || message.author?.bot || !message.guild) return;

        // Check if message has user mentions and those members exist
        if (message.mentions?.members?.size > 0) {
            const mentionedUserIds = message.mentions.users.map(user => user.id);

            // Only query if mentionedUserIds isn't empty
            if (mentionedUserIds.length > 0) {
                const afkUsers = await client.db.Afk.find({
                    userId: { $in: mentionedUserIds },
                    guildId: message.guild.id,
                });

                afkUsers.forEach(afkUser => {
                    message.reply(
                        `<@${afkUser.userId}> is currently AFK: ${afkUser.reason} - <t:${Math.round(afkUser.createdAt / 1000)}:R>`
                    );
                });
            }
        }

        // Check if message author was AFK and remove them
        const afkCheck = await client.db.Afk.findOneAndDelete({
            userId: message.author.id,
            guildId: message.guild.id,
        });

        if (afkCheck) {
            message.reply(`${message.author.tag} is no longer AFK.`);
        }
    }
}
