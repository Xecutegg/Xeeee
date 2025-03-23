// Command: autoresponderlist
import { EmbedBuilder } from "discord.js";
import AutoResponder from "../../database/models/autoResponder.js";

export default {
    name: "autoresponderlist",
    category: "utility",
    description: "List all auto-response triggers",
    usage: "autoresponderlist",
    botperms: ["SendMessages"],
    userperms: ["ManageGuild"],
    aliases: ["arlist"],

    async execute(client, message) {
        try {
            const responders = await AutoResponder.find({ guildId: message.guild.id });
            
            if (responders.length === 0) {
                return message.reply("❌ No auto-responses configured for this server.");
            }

            const embed = new EmbedBuilder()
                .setTitle("Auto-Responder List")
                .setColor("#2b2d31")
                .setDescription(responders.map((r, i) => 
                    `**${i + 1}.** Trigger: \`${r.trigger}\`\n` +
                    `Response: ${r.response?.substring(0, 50) || "[Embed]"}...\n` +
                    `Status: ${r.status ? "✅ Enabled" : "❌ Disabled"}`
                ).join("\n\n"))
                .setFooter({ text: "Use autoresponderdelete <trigger> to remove a response." });

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Auto-responder list command error:", error);
            return message.reply("❌ An error occurred while retrieving the auto-responder list.");
        }
    }
};