import StickyMessage from "../../database/models/stickMsg.js";
import { EmbedBuilder } from "discord.js";

export default {
    name: "stickyMessageHandler",
    isEvent: true,
    type: "messageCreate",

    async execute(client, message) {
        if (!message.guild || message.author?.bot) return;

        try {
            const stickyData = await StickyMessage.findOne({ channelId: message.channel.id });
            if (!stickyData) return;

            // Try deleting previous sticky message
            if (stickyData.messageId) {
                try {
                    const previousStickyMsg = await message.channel.messages.fetch(stickyData.messageId).catch(() => null);
                    if (previousStickyMsg) {
                        await previousStickyMsg.delete().catch(() => {});
                    } else {
                        console.warn(`⚠️ Sticky message already deleted or not found (ID: ${stickyData.messageId})`);
                    }
                } catch (err) {
                    console.warn("⚠️ Could not fetch or delete the previous sticky message:", err.message);
                }
            }

            // Send new sticky message
            let newStickyMsg;

            if (
                stickyData.embedOptions &&
                typeof stickyData.embedOptions === "object" &&
                Object.keys(stickyData.embedOptions).length > 0
            ) {
                const embed = new EmbedBuilder(stickyData.embedOptions);
                newStickyMsg = await message.channel.send({ embeds: [embed] });
            } else if (typeof stickyData.message === "string" && stickyData.message.trim().length > 0) {
                newStickyMsg = await message.channel.send(stickyData.message);
            } else {
                console.warn("⚠️ Sticky message content is missing or invalid.");
                return;
            }

            // Safely update the DB with new messageId
            const exists = await StickyMessage.exists({ _id: stickyData._id });
            if (exists) {
                stickyData.messageId = newStickyMsg.id;
                await stickyData.save();
            } else {
                console.warn(`⚠️ Sticky document no longer exists in DB (_id: ${stickyData._id})`);
            }
        } catch (error) {
            console.error("❌ Error in stickyMessageHandler event:", error.message);
        }
    }
};
