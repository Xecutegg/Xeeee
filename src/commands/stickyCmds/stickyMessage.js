import { EmbedBuilder } from "discord.js";
import StickyMessage from "../../database/models/stickMsg.js"; // ✅ Fixed typo in model import

export default {
    name: "sticky",
    category: "sticky",
    description: "Make a message sticky",
    usage: "sticky <message>",
    botperms: ["ManageMessages"],
    userperms: ["ManageMessages"],
    aliases: ["stick"],

    async execute(client, message, args) {
        try {
            if (!args.length) {
                return message.reply("❌ Please provide a message to make sticky.");
            }

            // Check for existing sticky message in the channel
            const existingData = await StickyMessage.findOne({ channelId: message.channel.id });

            // If a sticky message exists, attempt to delete the old one
            if (existingData?.messageId) {
                try {
                    const oldMsg = await message.channel.messages.fetch(existingData.messageId);
                    if (oldMsg) await oldMsg.delete();
                } catch (err) {
                    console.warn("⚠️ Previous sticky message could not be fetched or deleted.");
                }
            }

            // Create the new sticky message embed
            const embed = new EmbedBuilder()
                .setColor("#0b77f8")
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setDescription(args.join(" "))
                .setFooter({ text: "This is a sticky message." })
                .setTimestamp();

            // Send the sticky message to the channel
            const newStickyMsg = await message.channel.send({ embeds: [embed] });

            // Save or update the sticky message data in MongoDB
            await StickyMessage.findOneAndUpdate(
                { channelId: message.channel.id },
                {
                    guildId: message.guild.id,
                    messageId: newStickyMsg.id,
                    message: args.join(" "),
                    channelId: message.channel.id,
                    embedOptions: embed.toJSON(), // Optional for re-creating later
                },
                { upsert: true }
            );

            return message.reply("✅ Sticky message has been set successfully.");
        } catch (error) {
            console.error("❌ Error in sticky command:", error);
            return message.reply("❌ An error occurred while setting the sticky message.");
        }
    },
};
