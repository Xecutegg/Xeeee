import { Colors, EmbedBuilder } from 'discord.js';
import { buttonPagination } from '../../../utils/buttonPaginater.js';

export default {
    name: "listbots",
    description: "List all bots in guild",
    usage: "No args required",
    category: "utility",
    botperms: ["SendMessages"],
    async execute(client, message, args) {
        try {
            let members = await message.guild.members.fetch();
            // Filter out bots
            let bots = members.filter(member => member.user.bot);

            if (bots.size === 0) return msg.edit("No bots found in this server.");

            const PerPage = 10;
            const totalPages = Math.ceil(bots.size / PerPage);
            const embeds = [];

            // Convert bots Collection to an array for pagination
            const botsArray = Array.from(bots.values());

            for (let i = 0; i < totalPages; i++) {
                const start = i * PerPage;
                const end = start + PerPage;
                const botsList = botsArray.slice(start, end)
                    .map((bot, index) => `${start + index + 1}. ${bot.user.tag} - (${bot.user.id})`)
                    .join('\n');

                // Avoid creating an embed with an empty description
                if (botsList.length > 0) {
                    const embed = new EmbedBuilder()
                        .setTitle('List of bots in Server')
                        .setDescription(botsList)
                        .setColor(Colors.Green)
                        .setFooter({ text: `${client.user.username} - Page ${i + 1}/${totalPages}`, iconURL: client.user.displayAvatarURL() });

                    embeds.push(embed);
                }
            }
            if (embeds.length > 0) {
                buttonPagination(message, embeds);
            } else {
                message.reply("No bots found in this server.");
            }

        } catch (error) {
            console.error(error);
            message.reply("An error occurred while fetching the bots.");
        }
    }
};
