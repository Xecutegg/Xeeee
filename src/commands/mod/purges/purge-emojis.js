export default {
    name: "purge-emojis",
    description: "Clears a specified number of messages containing emojis from the channel.",
    usage: "[number=optional]",
    userPermissions: ['ManageMessages'],
    botPermissions: ['ManageMessages'],
    category: "moderation",
    aliases: ['clear-emojis', 'pe'],
    async execute(client, message, args) {
        const amount = parseInt(args[0]) || 100;

        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply("Please provide a number between 1 and 100 for the number of messages to delete.");
        }

        try {
            const messages = await message.channel.messages.fetch({ limit: amount });
            const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji}\p{Emoji_Modifier_Base}|\p{Emoji_Modifier})/gu;
            const filteredMessages = messages.filter(msg => emojiRegex.test(msg.content));

            if (filteredMessages.size === 0) {
                return message.reply("No messages found containing emojis.");
            }

            await message.channel.bulkDelete(filteredMessages);

            let resultMessage = `I have deleted ${filteredMessages.size} messages containing emojis.`;
            let msg = await message.channel.send(resultMessage);
            setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
        } catch (error) {
            console.error(`Error in purge-emojis command: ${error.message}`);
            message.reply("An error occurred while trying to delete messages.");
        }
    }
}
