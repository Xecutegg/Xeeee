import { Colors, EmbedBuilder } from "discord.js";

export default {
    name: "snipe",
    description: "Retrieves the most recently deleted messages in the channel.",
    usage: "[number]",
    category: "utility",
    async execute(client, message, args) {
        try {
            const limit = parseInt(args[0], 10) || 1;
            const fetchLimit = Math.min(limit, 20);

            const snipedMessages = await client.db.Snipe.find({
                guildId: message.guild.id,
                channelId: message.channel.id
            })
                .sort({ createdAt: -1 })
                .limit(fetchLimit);

            if (snipedMessages.length === 0) {
                return message.reply("There are no sniped messages to display.");
            }
            // Create a single embed for all sniped messages
            let embedDescription = '';
            for (const msg of snipedMessages) {
                embedDescription += `**Author:** ${message.guild.members.cache.get(msg.authorId).user.tag || "Unknown"}\n` +
                    `**Message:** ${msg.content}\n` +
                    `**Deleted At:** ${msg.createdAt.toLocaleString()}\n\n`;
            }
            const embed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('Recently Deleted Messages')
                .setDescription(embedDescription.length > 2048 ? embedDescription.substring(0, 2045) + '...' : embedDescription)
                .setFooter({ text: `Showing ${snipedMessages.length} message(s)` });

            // Send the embed
            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(`Error in snipe command: ${error.message}`);
            message.reply("An error occurred while retrieving sniped messages.");
        }
    }
};
