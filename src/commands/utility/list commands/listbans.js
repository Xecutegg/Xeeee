import { Colors, EmbedBuilder } from 'discord.js';
import { buttonPagination } from '../../../utils/buttonPaginater.js';

export default {
    name: "listbans",
    description: "List all banned members in the server",
    usage: "No args required",
    category: "utility",
    botperms: ["BanMembers"],
    async execute(client, message, args) {
        try {
            let bans = await message.guild.bans.fetch();

            if (bans.size === 0) {
                return msg.edit("No banned members found in this server.");
            }

            const PerPage = 10;
            const totalPages = Math.ceil(bans.size / PerPage);
            const embeds = [];

            // Convert bans Collection to an array for pagination
            const bansArray = Array.from(bans.values());

            // Create embeds for banned members
            for (let i = 0; i < totalPages; i++) {
                const start = i * PerPage;
                const end = start + PerPage;
                const banList = bansArray.slice(start, end)
                    .map((ban, index) => `${start + index + 1}. ${ban.user.tag} - (${ban.user.id})\nReason: ${ban.reason || "No reason provided"}`)
                    .join('\n');

                if (banList.length > 0) {
                    const embed = new EmbedBuilder()
                        .setTitle('List of Banned Members')
                        .setDescription(banList)
                        .setColor(Colors.Green)
                        .setFooter({ text: `${client.user.username} - Page ${i + 1}/${totalPages}`, iconURL: client.user.displayAvatarURL() });

                    embeds.push(embed);
                }
            }

            if (embeds.length > 0) {
                buttonPagination(message, embeds);
            } else {
                message.reply("No banned members found.");
            }

        } catch (error) {
            console.error(error);
            message.reply("An error occurred while fetching the banned members.");
        }
    }
};
