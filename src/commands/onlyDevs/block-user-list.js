import clientConfig from "../../database/models/clientConfig.js";
import { buttonPagination } from "../../utils/buttonPaginater.js";
import { Colors, EmbedBuilder } from 'discord.js';

export default {
    name: "block-user-list",
    aliases: ["block-user-list"],
    description: "List of users from the blocklist.",
    usage: "",
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: "admin",
    devOnly: true,
    async execute(client, message, args) {
        try {
            const config = await clientConfig.findOne({});
            if (!config || !config.blocklistusers || config.blocklistusers.length === 0) {
                return message.reply("No users are currently blocked.");
            }

            const blockedUsers = config.blocklistusers;
            const embeds = [];
            const itemsPerPage = 10;
            const totalPages = Math.ceil(blockedUsers.length / itemsPerPage);
            for (let i = 0; i < blockedUsers.length; i += itemsPerPage) {
                const currentPage = Math.floor(i / itemsPerPage) + 1;
                const embed = new EmbedBuilder()
                    .setTitle(`Blocked Users - Page ${currentPage}`)
                    .setColor(Colors.Green);

                const usersToShow = blockedUsers.slice(i, i + itemsPerPage);
                let description = '';
                usersToShow.forEach(user => {
                    description += `**User ID:** ${user.id}\n**Reason:** ${user.reason}\n\n`;
                });

                embed.setDescription(description);
                embed.setFooter({ text: `Page ${currentPage} of ${totalPages}` });
                embeds.push(embed);
            }

            buttonPagination(message, embeds);

        } catch (error) {
            console.error(error);
            message.reply("An error occurred while fetching the blocklist. Please try again later.");
        }
    }
};
