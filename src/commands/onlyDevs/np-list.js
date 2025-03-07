import clientConfig from "../../database/models/clientConfig.js";
import { EmbedBuilder, Colors } from 'discord.js';
import { buttonPagination } from "../../utils/buttonPaginater.js";

export default {
    name: "np-list",
    description: "List of non-prefixed users.",
    usage: "np-list",
    aliases: ['np', "nplist"],
    botperms: ["EmbedLinks"],
    async execute(client, message) {
        try {
            let botconfig = await clientConfig.findOne({});
            let np_users_id = botconfig?.np_users || [];
            if (np_users_id.length === 0) {
                return message.reply("No np-users found in the database.");
            }

            let np_users = message.guild.members.cache.filter(member => np_users_id.includes(member.id));

            if (np_users.size === 0) {
                return message.reply("No np-users found in this server.");
            }

            const PerPage = 10;
            const np_usersArray = Array.from(np_users.values());
            const totalPages = Math.ceil(np_usersArray.length / PerPage);
            const embeds = [];

            for (let i = 0; i < totalPages; i++) {
                const start = i * PerPage;
                const end = start + PerPage;
                const usersList = np_usersArray.slice(start, end)
                    .map((user, index) => `${start + index + 1}. ${user.user.tag} - (${user.user.id})`)
                    .join('\n');

                if (usersList.length > 0) {
                    const embed = new EmbedBuilder()
                        .setTitle('List of Non-Prefixed Users')
                        .setDescription(usersList)
                        .setColor(Colors.Red)
                        .setFooter({ 
                            text: `${client.user.username} - Page ${i + 1}/${totalPages}`, 
                            iconURL: client.user.displayAvatarURL() 
                        });

                    embeds.push(embed);
                }
            }

            if (embeds.length > 0) {
                buttonPagination(message, embeds);
            } else {
                message.reply("No np-users found in this db.");
            }
        } catch (error) {
            console.error(`Error while executing np-list: ${error.message}`);
            message.reply("An error occurred while fetching the non-prefixed users.");
        }
    }
};
