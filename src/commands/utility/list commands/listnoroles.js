import { Colors, EmbedBuilder } from 'discord.js';
import { buttonPagination } from '../../../utils/buttonPaginater.js';

export default {
    name: "listnoroles",
    description: "List all members without any roles",
    usage: "No args required",
    category: "utility",
    botperms: ["SendMessages"],
    async execute(client, message, args) {
        try {
            let members = await message.guild.members.fetch();
            // Filter out members without roles (excluding @everyone role)
            let noRoleMembers = members.filter(member => member.roles.cache.filter(role => role.name !== '@everyone').size === 0);

            if (noRoleMembers.size === 0) {
                return msg.edit("No members found without any roles.");
            }

            const PerPage = 10;
            const totalPages = Math.ceil(noRoleMembers.size / PerPage);
            const embeds = [];

            // Convert noRoleMembers Collection to an array for pagination
            const noRoleMembersArray = Array.from(noRoleMembers.values());

            for (let i = 0; i < totalPages; i++) {
                const start = i * PerPage;
                const end = start + PerPage;
                const membersList = noRoleMembersArray.slice(start, end)
                    .map((member, index) => `${start + index + 1}. ${member.user.tag} - (${member.user.id})`)
                    .join('\n');

                // Avoid creating an embed with an empty description
                if (membersList.length > 0) {
                    const embed = new EmbedBuilder()
                        .setTitle('List of Members without Roles')
                        .setDescription(membersList)
                        .setColor(Colors.Green)
                        .setFooter({ text: `${client.user.username} - Page ${i + 1}/${totalPages}`, iconURL: client.user.displayAvatarURL() });

                    embeds.push(embed);
                }
            }
            if (embeds.length > 0) {
                buttonPagination(message, embeds);
            } else {
                message.reply("No members found without any roles.");
            }

        } catch (error) {
            console.error(error);
            message.reply("An error occurred while fetching members without roles.");
        }
    }
};
