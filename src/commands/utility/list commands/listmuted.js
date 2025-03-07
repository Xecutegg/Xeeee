import { Colors, EmbedBuilder } from 'discord.js';
import { buttonPagination } from '../../../utils/buttonPaginater.js';

export default {
    name: "listmuted",
    description: "List all members who are currently timed out (muted) in the server",
    usage: "No args required",
    category: "utility",
    botperms: ["SendMessages"],
    async execute(client, message, args) {
        try {
            const members = await message.guild.members.fetch();

            // Filter members who are currently timed out (muted)
            const mutedMembers = members.filter(member => member.communicationDisabledUntilTimestamp !== null);

            if (mutedMembers.size === 0) {
                return msg.edit("No members are currently muted (timed out) in this server.");
            }

            const PerPage = 10;
            const totalPages = Math.ceil(mutedMembers.size / PerPage);
            const embeds = [];

            // Convert filtered members Collection to an array for pagination
            const mutedMembersArray = Array.from(mutedMembers.values());

            // Create embeds for muted members
            for (let i = 0; i < totalPages; i++) {
                const start = i * PerPage;
                const end = start + PerPage;
                const memberList = mutedMembersArray.slice(start, end)
                    .map((member, index) => {
                        const unmuteTimestamp = member.communicationDisabledUntilTimestamp;
                        return `${start + index + 1}. ${member.user.tag} - (${member.user.id})\nUnmute in: <t:${Math.round(unmuteTimestamp /1000)}:R>`;
                    })
                    .join('\n');

                if (memberList.length > 0) {
                    const embed = new EmbedBuilder()
                        .setTitle('List of Muted Members')
                        .setDescription(memberList)
                        .setColor(Colors.Red)
                        .setFooter({ text: `${client.user.username} - Page ${i + 1}/${totalPages}`, iconURL: client.user.displayAvatarURL() });

                    embeds.push(embed);
                }
            }
            if (embeds.length > 0) {
                buttonPagination(message, embeds);
            } else {
                message.reply("No muted members found in this server.");
            }

        } catch (error) {
            console.error(error);
            message.reply("An error occurred while fetching the muted members.");
        }
    }
};
