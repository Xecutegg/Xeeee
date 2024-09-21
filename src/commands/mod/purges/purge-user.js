export default {
    name: "purge-user",
    description: "Clears a specified number of messages from a specific user in the channel.",
    usage: "<user> [number=optional]",
    userPermissions: ['ManageMessages'],
    botPermissions: ['ManageMessages'],
    category: "moderation",
    aliases: ['clear-user', 'pu'],
    async execute(client, message, args) {
        const userMention = args[0];
        const amount = parseInt(args[1]) || 100;
        
        if (!userMention) {
            return message.reply("Please provide a user to purge messages from.");
        }

        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply("Please provide a number between 1 and 100 for the number of messages to delete.");
        }

        let user;
        try {
            user = message.mentions.users.first() || (await client.users.fetch(userMention.replace(/[<@!>]/g, '')));
        } catch {
            return message.reply("Unable to find the specified user.");
        }

        if (!user) {
            return message.reply("Please mention a valid user.");
        }

        try {
            const messages = await message.channel.messages.fetch({ limit: amount });
            const filteredMessages = messages.filter(msg => msg.author.id === user.id);

            if (filteredMessages.size === 0) {
                return message.reply("No messages found from the specified user.");
            }

            await message.channel.bulkDelete(filteredMessages);

            let resultMessage = `I have deleted ${filteredMessages.size} messages from ${user.tag}.`;
            let msg = await message.channel.send(resultMessage);
            setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
        } catch (error) {
            console.error(`Error in purge command: ${error.message}`);
            message.reply("An error occurred while trying to delete messages.");
        }
    }
}
