import WelcomeSettings from "../../database/models/welcome.js";
import { Colors, EmbedBuilder } from "discord.js";

export default {
    name: "welcome-delete",
    description: "Delete a welcome channel",
    usage: "<channelID>",
    category: "welcomer",
    aliases: ["wd", "welcomedelete", "deletewelcome"],
    botperms: ["ManageChannels"],
    userperms: ["ManageChannels"],
    async execute(client, message, args) {
        try {
            if (!args[0]) {
                return message.reply("Please provide the channel ID of the welcome channel you want to delete.");
            }
            const channelId = args[0].replace(/^<#|>$/g, '');
            const result = await WelcomeSettings.findOneAndDelete({ guildId: message.guild.id, channelId });

            if (!result) {
                return message.reply(`No welcome channel found with ID ${channelId}.`);
            }
            const embed = new EmbedBuilder()
                .setTitle("Welcome Channel Deleted")
                .setDescription(`The welcome channel <#${channelId}> has been successfully deleted.`)
                .setColor(Colors.Green);

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error.message);
            message.reply(`An error occurred while deleting the welcome channel: ${error.message}`);
        }
    }
}
