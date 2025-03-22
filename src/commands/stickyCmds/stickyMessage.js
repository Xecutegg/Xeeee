import { EmbedBuilder } from "discord.js";
import StrikyMessage from "../../database/models/stickMsg.js";

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

            let data = await StrikyMessage.findOne({ channelId: message.channel.id });

            // If a sticky message exists, delete the old one first
            if (data && data.messageId) {
                try {
                    const oldMsg = await message.channel.messages.fetch(data.messageId);
                    if (oldMsg) await oldMsg.delete();
                } catch (err) {
                    console.log("Old message not found, skipping deletion.");
                }
            }

            // Create a new embed
            const embed = new EmbedBuilder()
                .setColor("#0b77f8")
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setDescription(args.join(" "))
                .setFooter({ text: "This Was Just A Sticky Message, Nothing Else." })
                .setTimestamp();

            // Send the sticky message
            const stickyMsg = await message.channel.send({ embeds: [embed] });

            // Save in database, including embedOptions
            await StrikyMessage.findOneAndUpdate(
                { channelId: message.channel.id },
                {
                    guildId: message.guild.id,
                    messageId: stickyMsg.id,
                    message: args.join(" "),
                    channelId: message.channel.id,
                    embedOptions: embed.toJSON(),  // ✅ Store embed options for later use
                },
                { upsert: true }
            );

            return message.reply("✅ Message has been made sticky.");
        } catch (error) {
            console.error("Sticky command error:", error);
            return message.reply("❌ An error occurred while setting the sticky message.");
        }
    },
};
