import StickyMessage from "../../database/models/stickMsg.js";
import { EmbedBuilder } from "discord.js";

export default {
    name: "stickyMessageHandler",
    isEvent: true,
    type: "messageCreate",

    async execute(client, message) {
        // Ignore DMs or bot messages
        if (!message.guild || message.author?.bot) return;

        try {
            const stickyData = await StickyMessage.findOne({ channelId: message.channel.id });
            if (!stickyData) return;

            // Delete the previous sticky message if it exists
            if (stickyData.messageId) {
                try {
                    const previousStickyMsg = await message.channel.messages.fetch(stickyData.messageId);
                    if (previousStickyMsg) await previousStickyMsg.delete().catch(() => {});
                } catch (err) {
                    console.warn("⚠️ Could not fetch or delete the previous sticky message:", err.message);
                }
            }

            // Re-send the sticky message
            let newStickyMsg;
            if (
                stickyData.embedOptions &&
                typeof stickyData.embedOptions === "object" &&
                Object.keys(stickyData.embedOptions).length > 0
            ) {
                const embed = new EmbedBuilder(stickyData.embedOptions); // Build embed safely
                newStickyMsg = await message.channel.send({ embeds: [embed] });
            } else if (typeof stickyData.message === "string") {
                newStickyMsg = await message.channel.send(stickyData.message);
            } else {
                console.warn("⚠️ Sticky message content missing or invalid.");
                return;
            }

            // Update the stored message ID
            stickyData.messageId = newStickyMsg.id;
            await stickyData.save();
        } catch (error) {
            console.error("❌ Error in stickyMessageHandler event:", error);
        }
    }
};
