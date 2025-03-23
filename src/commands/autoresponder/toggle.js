import AutoResponder from "../../database/models/autoResponder.js";

export default {
    name: "autoresponder-toggle",
    category: "autoresponder",
    description: "Enable or disable a specific autoresponder trigger",
    usage: "autoresponder-toggle <trigger>",
    botperms: ["SendMessages"],
    userperms: ["ManageGuild"],
    aliases: ["ar-toggle"],

    async execute(client, message, args) {
        try {
            if (args.length < 1) {
                return message.reply("❌ Usage: `autoresponder-toggle <trigger>`");
            }

            const trigger = args[0].toLowerCase();

            // **Find the AutoResponder in the database**
            const responder = await AutoResponder.findOne({
                guildId: message.guild.id,
                trigger: trigger
            });

            if (!responder) {
                return message.reply("❌ No autoresponder found with this trigger.");
            }

            // **Toggle the status**
            responder.status = !responder.status;
            await responder.save();

            return message.reply(`✅ Autoresponder for **"${trigger}"** is now **${responder.status ? "enabled" : "disabled"}**.`);
        } catch (error) {
            console.error("AutoResponder Toggle Command Error:", error);
            return message.reply("❌ An error occurred while toggling the autoresponder.");
        }
    }
};
