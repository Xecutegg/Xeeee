export default {
    name: "purge-bots",
    description: "Clears a specified number of messages sent by bots from the channel.",
    usage: "[number=optional]",
    userPermissions: ['ManageMessages'],
    botPermissions: ['ManageMessages'],
    category: "moderation",
    aliases: ['clear-bots', 'pb'],
    async execute(client, message, args) {
        const amount = parseInt(args[0]) || 100;

        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply("Please provide a number between 1 and 100 for the number of messages to delete.");
        }

        try {
            const messages = await message.channel.messages.fetch({ limit: amount });
            const filteredMessages = messages.filter(msg => msg.author.bot);

            if (filteredMessages.size === 0) {
                return message.reply("No messages found from bots.");
            }

            await message.channel.bulkDelete(filteredMessages);

            let resultMessage = `I have deleted ${filteredMessages.size} messages sent by bots.`;
            let msg = await message.channel.send(resultMessage);
            setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
        } catch (error) {
            console.error(`Error in purge-bots command: ${error.message}`);
            message.reply("An error occurred while trying to delete messages.");
        }
    }
}
