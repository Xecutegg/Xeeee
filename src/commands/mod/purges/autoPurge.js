export default {
    name: "autopurge",
    description: "Automatically deletes unpinned and non-ping messages from a specified channel after a delay.",
    usage: "<channel mention or ID> <time in seconds>",
    userPermissions: ['ManageMessages'],
    botPermissions: ['ManageMessages'],
    category: "moderation",
    aliases: [],

    async execute(client, message, args) {
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        const delay = parseInt(args[1]);

        if (!channel || channel.type !== 0) { // 0 = GUILD_TEXT
            return message.reply("Please mention a valid text channel.");
        }

        if (isNaN(delay) || delay < 5 || delay > 86400) {
            return message.reply("Please provide a time in seconds (min: 5, max: 86400).");
        }

        message.reply(`✅ Autopurge is set for <#${channel.id}> after ${delay} seconds. Ping messages will be skipped.`);

        setTimeout(async () => {
            try {
                const fetched = await channel.messages.fetch({ limit: 100 });

                const messagesToDelete = fetched.filter(msg =>
                    !msg.pinned &&
                    msg.createdTimestamp > Date.now() - 13 * 24 * 60 * 60 * 1000 && // Not older than 14 days
                    msg.mentions.users.size === 0 &&
                    msg.mentions.roles.size === 0
                );

                if (messagesToDelete.size === 0) {
                    return channel.send("⚠️ No eligible messages to delete.");
                }

                await channel.bulkDelete(messagesToDelete, true);
                channel.send(`🧹 Autopurge complete. Deleted ${messagesToDelete.size} non-ping message(s).`)
                    .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
            } catch (err) {
                console.error("Autopurge error:", err);
                channel.send("❌ Failed to purge messages. Check permissions or message age.");
            }
        }, delay * 1000);
    }
};
