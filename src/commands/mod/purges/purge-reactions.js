export default {
    name: "purge-reactions",
    description: "Deletes messages containing a specific reaction from the channel.",
    usage: "<reaction> [number=optional]",
    userPermissions: ['ManageMessages'],
    botPermissions: ['ManageMessages'],
    category: "moderation",
    aliases: ['clear-reactions', 'pr'],
    async execute(client, message, args) {
        const reaction = args[0];
        if (!reaction) {
            return message.reply("Please provide a reaction to search for.");
        }

        const amount = parseInt(args[1]) || 100;
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply("Please provide a number between 1 and 100 for the number of messages to delete.");
        }

        try {
            const messages = await message.channel.messages.fetch({ limit: amount });
            const filteredMessages = messages.filter(async msg => {
                const reactions = msg.reactions.cache;
                return reactions.some(reactionItem => reactionItem.emoji.name === reaction);
            });

            if (filteredMessages.size === 0) {
                return message.reply("No messages found with the specified reaction.");
            }

            const deletedMessages = await message.channel.bulkDelete(filteredMessages);
            let resultMessage = `I have deleted ${deletedMessages.size} messages containing the reaction "${reaction}".`;
            let msg = await message.channel.send(resultMessage);
            setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
        } catch (error) {
            console.error(`Error in purge-reactions command: ${error.message}`);
            message.reply("An error occurred while trying to delete messages.");
        }
    }
}
