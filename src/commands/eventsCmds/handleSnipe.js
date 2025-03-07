export default {
    name: "SnipeHandler",
    description: "Handles sniping functionality",
    isEvent: true,
    type: "messageDelete",
    async execute(client, message) {
        if (!message || !message.guild || !message.author) {
            console.error('Message object is missing required properties.');
            return;
        }
        if (message.author.bot || !message.content) return;

        try {
            const channelId = message.channel.id;
            const guildId = message.guild.id;

            // Check if the channel already has 20 deleted messages
            const messageCount = await client.db.Snipe.countDocuments({ guildId, channelId });

            if (messageCount >= 20) {
                await client.db.Snipe.findOneAndDelete({ guildId, channelId }, { sort: { createdAt: 1 } });
            }

            // Insert the new deleted message
            await client.db.Snipe.create({
                guildId,
                channelId,
                messageId: message.id,
                content: message.content,
                authorId: message.author.id,
                createdAt: message.createdAt
            });
        } catch (error) {
            console.error(`Error in SnipeHandler: ${error.message}`);
        }
    }
}
