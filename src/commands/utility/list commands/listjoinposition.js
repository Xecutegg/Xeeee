import { Colors, EmbedBuilder } from 'discord.js';
import { buttonPagination } from '../../../utils/buttonPaginater.js';

export default {
    name: "listjoinposition",
    description: "List members by their join position in the server with join date in milliseconds",
    usage: "No args required",
    category: "utility",
    botperms: ["SendMessages"],
    async execute(client, message, args) {
        try {
            const members = await message.guild.members.fetch();

            // Sort members by their join date
            const sortedMembers = members.sort((a, b) => a.joinedAt - b.joinedAt);

            const PerPage = 10;
            const totalPages = Math.ceil(sortedMembers.size / PerPage);
            const embeds = [];

            // Convert sorted members Collection to an array for pagination
            const sortedMembersArray = Array.from(sortedMembers.values());

            // Create embeds for members by join position
            for (let i = 0; i < totalPages; i++) {
                const start = i * PerPage;
                const end = start + PerPage;
                const memberList = sortedMembersArray.slice(start, end)
                    .map((member, index) => {
                        const joinTimestamp = Math.floor(member.joinedAt.getTime() / 1000); // Get the time in seconds for Discord's format
                        return `${start + index + 1}. ${member.user.tag} - (${member.user.id})\nJoined: <t:${joinTimestamp}:R>`;
                    })
                    .join('\n');

                if (memberList.length > 0) {
                    const embed = new EmbedBuilder()
                        .setTitle('List of Members by Join Position')
                        .setDescription(memberList)
                        .setColor(Colors.Blue)
                        .setFooter({ text: `${client.user.username} - Page ${i + 1}/${totalPages}`, iconURL: client.user.displayAvatarURL() });

                    embeds.push(embed);
                }
            }
            if (embeds.length > 0) {
                buttonPagination(message, embeds);
            } else {
                message.reply("No members found in this server.");
            }

        } catch (error) {
            console.error(error);
            message.reply("An error occurred while fetching the join positions.");
        }
    }
};
