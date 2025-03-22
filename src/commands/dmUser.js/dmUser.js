import { EmbedBuilder } from "discord.js";
import StickyMessage from "../../database/models/stickMsg.js";

export default {
    name: "dm",
    category: "utility",
    description: "Send a direct message to a user",
    usage: "dm <@user> <message>",
    botperms: ["SendMessages"],
    userperms: ["ManageMessages"],
    aliases: ["directmessage", "message"],
    async execute(client, message, args) {
        try {
            if (!args.length || !message.mentions.users.size) {
                return message.reply("❌ Please mention a user and provide a message.");
            }

            const user = message.mentions.users.first();
            const dmMessage = args.slice(1).join(" ");

            if (!dmMessage) return message.reply("❌ Please provide a message to send.");

            const dmEmbed = new EmbedBuilder()
                .setColor("#0b77f8")
                .setAuthor({ name: `Message from ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setDescription(dmMessage)
                .addFields({ name: "From Guild", value: message.guild.name, inline: true })
                .setTimestamp();

            try {
                await user.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.error("Failed to send DM:", dmError);
                return message.reply("❌ Unable to send DM. The user might have DMs disabled.");
            }

            const confirmationEmbed = new EmbedBuilder()
                .setColor("#0b77f8")
                .setTitle("📩 DM Sent Successfully")
                .setDescription(`Message sent to **${user.tag}**:`)
                .addFields(
                    { name: "Message", value: `\`\`${dmMessage}\`\`` },
                    { name: "From Guild", value: message.guild.name, inline: true }
                )
                .setFooter({ text: `Sent by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            try {
                await StickyMessage.create({
                    guildId: message.guild.id,
                    messageId: message.id,
                    message: dmMessage,
                    channelId: message.channel.id
                });
            } catch (dbError) {
                console.error("❌ Failed to save DM in database:", dbError);
                return message.reply("✅ DM sent, but logging failed. Please check the database.");
            }

            return message.reply({ embeds: [confirmationEmbed] });
        } catch (error) {
            console.error("Error in DM command:", error);
            return message.reply("❌ An unexpected error occurred.");
        }
    },
};
