import StrickyHandler from "../../database/models/stickMsg.js";

export default {
    name: "dmUserHandler",
    isEvent: true,
    type: "messageCreate",
    async execute(client, message) {
        if (message.author.bot) return;

        try {
            // Check if the message contains a DM command (example: !dm @user Hello)
            if (!message.content.startsWith("!dm")) return;

            // Extract user mention and message from the command
            const args = message.content.split(" ");
            if (args.length < 3) return message.reply("❌ Usage: `!dm @user Your message`");

            const user = message.mentions.users.first();
            const dmMessage = args.slice(2).join(" ");

            if (!user) return message.reply("❌ Please mention a valid user.");

            // Send DM to the user
            await user.send(dmMessage);

            // Save DM info in MongoDB
            const savedMessage = await StrickyHandler.create({
                guidlid: message.guild.id,
                messageId: message.id,
                message: dmMessage,
                channelId: message.channel.id
            });

            await message.reply(`✅ DM sent to ${user.tag} and logged in the database.`);
            console.log("📌 DM saved:", savedMessage);

        } catch (error) {
            console.error("Error in dmUserHandler event:", error);
            message.reply("❌ Failed to send DM.");
        }
    }
};
