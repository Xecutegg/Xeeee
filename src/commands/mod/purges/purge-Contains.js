export default {
    name: "purge-contains",
    description: "Clears a specified str message number of messages from the channel.",
    usage: "<str> [number=optional]",
    userPermissions: ['ManageMessages'],
    botPermissions: ['ManageMessages'],
    category: "moderation",
    aliases: ['clear-contains', 'pc'],
    async execute(client, message, args) {
        const str = args[0];
        if (!str) {
            return message.reply("Please provide a string to search for.");
        }

        const amount = parseInt(args[1]) || 100;
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply("Please provide a number between 1 and 100 for the number of messages to delete.");
        }

        try {
            const messages = await message.channel.messages.fetch({ limit: amount });
            const filteredMessages = messages.filter(msg => msg.content.includes(str));
            if (filteredMessages.size === 0) {
                return message.reply("No messages found containing the specified string.");
            }

            const userMessageCount = new Map();
            await message.channel.bulkDelete(filteredMessages).then(deletedMessages => {
                deletedMessages.forEach(m => {
                    if (!userMessageCount.has(m.author.tag)) {
                        userMessageCount.set(m.author.tag, 0);
                    }
                    userMessageCount.set(m.author.tag, userMessageCount.get(m.author.tag) + 1);
                });
            });

            let resultMessage = `I have deleted ${filteredMessages.size} messages.\nDeleted messages per user:\n`;
            userMessageCount.forEach((count, user) => {
                resultMessage += `\`${user}: ${count} message(s)\`\n`;
            });
            let msg = await message.channel.send(resultMessage);
            setTimeout(() => {
                msg.delete().catch(() => { });
            }, 5000);
        } catch (error) {
            console.error(`Error in purge command: ${error.message}`);
            message.reply("An error occurred while trying to delete messages.");
        }
    }
}
