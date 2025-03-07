import { Colors, EmbedBuilder } from 'discord.js';
import { buttonPagination } from '../../../utils/buttonPaginater.js';

export default {
    name: "listmods",
    description: "List all moderators in the server",
    usage: "No args required",
    category: "utility",
    botperms: ["SendMessages"],
    async execute(client, message, args) {
        try {
            let members = await message.guild.members.fetch();
            const modPermissions = [
                'ManageMessages',
                'KickMembers',
                'BanMembers',
                'ManageRoles',
                'ManageChannels',
                'MuteMembers',
                'DeafenMembers',
                'MoveMembers'
            ];

            // Filter out members who have any of the defined mod permissions
            let mods = members.filter(member => 
                member.permissions.any(modPermissions) && 
                !member.permissions.has('Administrator') // Exclude Admins if you only want to list mods
            );

            if (mods.size === 0) {
                return msg.edit("No moderators found in this server.");
            }

            const PerPage = 10;
            const totalPages = Math.ceil(mods.size / PerPage);
            const embeds = [];

            // Convert mods Collection to an array for pagination
            const modsArray = Array.from(mods.values());

            // Create embeds for moderators
            for (let i = 0; i < totalPages; i++) {
                const start = i * PerPage;
                const end = start + PerPage;
                const modList = modsArray.slice(start, end)
                    .map((mod, index) => `${start + index + 1}. ${mod.user.tag} - (${mod.user.id})`)
                    .join('\n');

                if (modList.length > 0) {
                    const embed = new EmbedBuilder()
                        .setTitle('List of Moderators in the Server')
                        .setDescription(modList)
                        .setColor(Colors.Purple)
                        .setFooter({ text: `${client.user.username} - Page ${i + 1}/${totalPages}`, iconURL: client.user.displayAvatarURL() });

                    embeds.push(embed);
                }
            }
            if (embeds.length > 0) {
                buttonPagination(message, embeds);
            } else {
                message.reply("No moderators found in this server.");
            }

        } catch (error) {
            console.error(error);
            message.reply("An error occurred while fetching the moderators.");
        }
    }
};
