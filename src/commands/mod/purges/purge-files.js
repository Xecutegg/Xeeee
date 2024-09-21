export default {
    name: "purge-files",
    description: "Clears a specified number of messages containing files from the channel.",
    usage: "[number=optional]",
    userPermissions: ['ManageMessages'],
    botPermissions: ['ManageMessages'],
    category: "moderation",
    aliases: ['clear-files', 'pf'],
    async execute(client, message, args) {
        const amount = parseInt(args[0]) || 100;

        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply("Please provide a number between 1 and 100 for the number of messages to delete.");
        }

        try {
            const messages = await message.channel.messages.fetch({ limit: amount });
            const filteredMessages = messages.filter(msg => msg.attachments.size > 0);

            if (filteredMessages.size === 0) {
                return message.reply("No messages found containing files.");
            }

            await message.channel.bulkDelete(filteredMessages);

            let resultMessage = `I have deleted ${filteredMessages.size} messages containing files.`;
            let msg = await message.channel.send(resultMessage);
            setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
        } catch (error) {
            console.error(`Error in purge-files command: ${error.message}`);
            message.reply("An error occurred while trying to delete messages.");
        }
    }
}
