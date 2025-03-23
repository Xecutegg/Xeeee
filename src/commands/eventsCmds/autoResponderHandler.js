import AutoResponder from "../../database/models/autoResponder.js";
import { EmbedBuilder } from "discord.js";

export default {
    name: "autoResponderHandler",
    isEvent: true,
    type: "messageCreate",

    async execute(client, message) {
        if (!message.guild || message.author.bot) return;

        try {
            // Fetch responder from the database (Check if status is true)
            const responderData = await AutoResponder.findOne({
                guildId: message.guild.id,
                trigger: message.content.trim().toLowerCase(),
                status: true // **Only check active triggers**
            });

            if (!responderData) return; // No matching active trigger

            if (responderData.isEmbed && responderData.embedOptions) {
                try {
                    const embed = new EmbedBuilder()
                        .setTitle(responderData.embedOptions.title || " ")
                        .setDescription(responderData.embedOptions.description || " ")
                        .setColor(responderData.embedOptions.color || "#00FF00");

                    await message.channel.send({ embeds: [embed] });
                } catch (embedError) {
                    console.error("Error creating embed in autoResponderHandler:", embedError);
                }
            } else if (responderData.response) {
                await message.channel.send(responderData.response);
            } else {
                console.warn(`AutoResponder found for trigger "${message.content}", but response is missing.`);
            }

        } catch (error) {
            console.error("Error in autoResponderHandler:", error);
        }
    }
};
