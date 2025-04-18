import StrikyMessage from "../../database/models/stickMsg.js";

export default {
    name: "stickydelete",
    category: "sticky",
    description: "Delete a sticky message",
    usage: "stickydelete",
    botPermissions: ["ManageMessages"],
    userPermissions: ["ManageMessages"],
    aliases: ["delstick"],
    
    async execute(client, message, args) {
        try {
            const data = await StrikyMessage.findOne({ channelId: message.channel.id });
            if (!data) {
                return message.reply("❌ No sticky message found in this channel.");
            }

            try {
                const prevmsg = await message.channel.messages.fetch(data.messageId);
                if (prevmsg) {
                    await prevmsg.delete().catch(() => {});
                }
            } catch (err) {
                if (err.code === 10008) {
                    console.warn("⚠️ Sticky message already deleted (Unknown Message).");
                } else {
                    console.error("Error deleting sticky message:", err);
                }
            }

            await StrikyMessage.findOneAndDelete({ channelId: message.channel.id });
            return message.reply("✅ Sticky message has been successfully deleted.");
        } catch (error) {
            console.error("Unhandled error in stickydelete command:", error);
            return message.reply("❌ An error occurred while trying to delete the sticky message.");
        }
    },
};
