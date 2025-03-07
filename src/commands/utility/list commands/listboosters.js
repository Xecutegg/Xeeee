import { Colors, EmbedBuilder } from 'discord.js';
import { buttonPagination } from '../../../utils/buttonPaginater.js';

export default {
    name: "listboosters",
    description: "List all members who are boosting the server",
    usage: "No args required",
    category: "utility",
    botperms: ["SendMessages"],
    async execute(client, message, args) {
        try {
            let members = await message.guild.members.fetch();

            // Filter out members who are boosting the server
            let boosters = members.filter(member => member.premiumSince);

            if (boosters.size === 0) {
                return msg.edit("No server boosters found.");
            }

            const PerPage = 10;
            const totalPages = Math.ceil(boosters.size / PerPage);
            const embeds = [];
            const boostersArray = Array.from(boosters.values());

            for (let i = 0; i < totalPages; i++) {
                const start = i * PerPage;
                const end = start + PerPage;
                const boosterList = boostersArray.slice(start, end)
                    .map((booster, index) => `${start + index + 1}. ${booster.user.tag} - Boosting since: ${booster.premiumSince.toDateString()}`)
                    .join('\n');

                if (boosterList.length > 0) {
                    const embed = new EmbedBuilder()
                        .setTitle('List of Server Boosters')
                        .setDescription(boosterList)
                        .setColor(Colors.Fuchsia)
                        .setFooter({ text: `${client.user.username} - Page ${i + 1}/${totalPages}`, iconURL: client.user.displayAvatarURL() });

                    embeds.push(embed);
                }
            }
            if (embeds.length > 0) {
                buttonPagination(message, embeds);
            } else {
                message.reply("No server boosters found.");
            }

        } catch (error) {
            console.error(error);
            message.reply("An error occurred while fetching the server boosters.");
        }
    }
};
