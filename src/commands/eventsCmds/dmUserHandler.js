import StickyHandler from "../../database/models/stickMsg.js";

export default {
    name: "dmUserHandler",
    isEvent: true,
    type: "messageCreate",
    async execute(client, message) {
        if (message.author.bot) return;

        try {
            // Check for the dmuser command
            if (!message.content.startsWith("!dmuser")) return;

            const args = message.content.trim().split(/ +/);
            if (args.length < 3) {
                return message.reply("❌ Usage: `!dmuser @user Your message`");
            }

            const user = message.mentions.users.first();
            const dmMessage = args.slice(2).join(" ");

            if (!user) {
                return message.reply("❌ Please mention a valid user.");
            }

            await user.send(dmMessage);

            const savedMessage = await StickyHandler.create({
                guildId: message.guild.id,
                messageId: message.id,
                message: dmMessage,
                channelId: message.channel.id,
            });

            await message.reply(`✅ DM sent to ${user.tag} and logged in the database.`);
            console.log("📌 DM saved:", savedMessage);

        } catch (error) {
            console.error("Error in dmUserHandler event:", error);
            message.reply("❌ Failed to send DM.");
        }
    }
};
