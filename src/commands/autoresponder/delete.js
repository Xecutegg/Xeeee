import AutoResponder from "../../database/models/autoResponder.js";

export default {
    name: "autoresponderdelete",
    category: "utility",
    description: "Delete an auto-response trigger",
    usage: "autoresponderdelete <trigger>",
    botperms: ["ManageMessages"],
    userperms: ["ManageMessages"],
    aliases: ["delar"],
    async execute(client, message, args) {
        try {
            if (!args.length) {
                return message.reply("❌ Please provide a trigger to delete.");
            }

            const trigger = args[0];
            const data = await AutoResponder.findOne({ guildId: message.guild.id, trigger });
            
            if (!data) {
                return message.reply("❌ No auto-responder found with that trigger.");
            }

            await AutoResponder.findOneAndDelete({ guildId: message.guild.id, trigger });
            return message.reply(`✅ Auto-responder for trigger **${trigger}** has been deleted.`);
        } catch (error) {
            console.error("Auto-responder delete command error:", error);
            return message.reply("❌ An error occurred while deleting the auto-responder.");
        }
    },
};