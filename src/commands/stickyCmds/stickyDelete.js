import StrikyMessage from "../../database/models/stickMsg.js";

export default {
    name: "stickydelete",
    category: "sticky",
    description: "Delete a sticky message",
    usage: "stickyDelete",
    botperms: ["ManageMessages"],
    userperms: ["ManageMessages"],
    aliases: ["Delstick"],
    async execute(client, message, args) {
        try {
            const data = await StrikyMessage.findOne({ channelId: message.channel.id });
            if (!data) return message.reply("No sticky message found in this channel");

            const prevmsg = await message.channel.messages.fetch(data.messageId).catch(() => null);
            if (prevmsg) await prevmsg.delete().catch(() => {});

            await StrikyMessage.findOneAndDelete({ channelId: message.channel.id });
            return message.reply("Sticky message has been deleted");
        } catch (error) {
         throw new Error(error.message);
         
        }
    },
};
