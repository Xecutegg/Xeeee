import { Colors, EmbedBuilder } from 'discord.js';
import { buttonPagination } from '../../../utils/buttonPaginater.js';

export default {
    name: "listadmins",
    description: "List all admins in the server",
    usage: "No args required",
    category: "utility",
    botperms: ["SendMessages"],
    async execute(client, message, args) {
        try {
            let members = await message.guild.members.fetch();

            // Filter out admins (members with the 'Administrator' permission)
            let admins = members.filter(member => !member.user.bot && member.permissions.has('Administrator'));

            if (admins.size === 0) {
                return msg.edit("No admins found in this server.");
            }

            const PerPage = 10;
            const totalPages = Math.ceil(admins.size / PerPage);
            const embeds = [];

            // Convert admins Collection to an array for pagination
            const adminsArray = Array.from(admins.values());

            // Create embeds for admins
            for (let i = 0; i < totalPages; i++) {
                const start = i * PerPage;
                const end = start + PerPage;
                const adminList = adminsArray.slice(start, end)
                    .map((admin, index) => `${start + index + 1}. ${admin.user.tag} - (${admin.user.id})`)
                    .join('\n');

                if (adminList.length > 0) {
                    const embed = new EmbedBuilder()
                        .setTitle('List of Admins in the Server')
                        .setDescription(adminList)
                        .setColor(Colors.Blue)
                        .setFooter({ text: `${client.user.username} - Page ${i + 1}/${totalPages}`, iconURL: client.user.displayAvatarURL() });

                    embeds.push(embed);
                }
            }

            // Send the paginated embed messages
            if (embeds.length > 0) {
                buttonPagination(message, embeds);
            } else {
                message.reply("No admins found in this server.");
            }

        } catch (error) {
            console.error(error);
            message.reply("An error occurred while fetching the admins.");
        }
    }
};
