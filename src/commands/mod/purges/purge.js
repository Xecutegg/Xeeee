export default {
    name: "purge",
    description: "Clears a specified number of messages from the channel.",
    usage: "<number>",
    userPermissions: ['ManageMessages'],
    botPermissions: ['ManageMessages'],
    category: "moderation",
    aliases: ['clear'],
    async execute(client, message, args) {
        const amount = parseInt(args[0]) || 5;
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply("Please provide a number between 1 and 100 for the number of messages to delete.");
        }

        try {
            const messages = await message.channel.messages.fetch({ limit: amount });
            const userMessageCount = new Map();

            await message.channel.bulkDelete(messages).then(msg => {
                msg.forEach(m => {
                    if (!userMessageCount.has(m.author.tag)) {
                        userMessageCount.set(m.author.tag, 0);
                    }
                    userMessageCount.set(m.author.tag, userMessageCount.get(m.author.tag) + 1);
                });
            });

            let resultMessage = `I have deleted ${messages.size} messages.\nDeleted messages per user:\n`;
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
