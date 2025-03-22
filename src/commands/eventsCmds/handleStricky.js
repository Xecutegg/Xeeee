import StrickyHandler from "../../database/models/stickMsg.js";
import { EmbedBuilder } from "discord.js";

export default {
    name: "stickyMessageHandler",
    isEvent: true,
    type: "messageCreate",
    async execute(client, message) {
        if (message.author.bot) return;
        try {
            const stickyData = await StrickyHandler.findOne({ channelId: message.channel.id });
            if (!stickyData) return;

            const previousStickyMsg = await message.channel.messages.fetch(stickyData.messageId).catch((e) => console.log(e));
            if (previousStickyMsg) await previousStickyMsg.delete().catch(() => {});

            // **Check if embed data exists and reconstruct it**
            let newStickyMsg;
            if (stickyData.embedOptions && Object.keys(stickyData.embedOptions).length > 0) {
                // Re-create the embed from stored data
                const embed = new EmbedBuilder(stickyData.embedOptions);
                newStickyMsg = await message.channel.send({ embeds: [embed] });
            } else {
                // If no embed, send plain text
                newStickyMsg = await message.channel.send(stickyData.message);
            }

            // Update database with new message ID
            stickyData.messageId = newStickyMsg.id;
            await stickyData.save();
        } catch (error) {
            console.error("Error in stickyMessageHandler event:", error);
        }
    }
};
