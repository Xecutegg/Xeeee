import { Colors, EmbedBuilder } from 'discord.js';
import resolveRole from '../../../utils/resolveRole.js'
import { buttonPagination } from '../../../utils/buttonPaginater.js';
export default {
    name: "listinrole",
    description: "List all members in a given role",
    usage: "<role mention or role name>",
    category: "utility",
    botperms: ["SendMessage"],
    async execute(client, message, args) {
        try {
            if (!args[0]) {
                return message.reply("Please provide a role mention, name, or ID.");
            }
            let role = await resolveRole(message, args[0]);

            if (!role) {
                return message.reply("Role not found.");
            }
            await message.guild.roles.fetch();
            await message.guild.members.fetch();
            const PerPage = 10;
            const totalpages = Math.ceil(role.members.size / PerPage);
            const embeds = [];
            for (let i = 0; i < totalpages; i++) {
                const start = i * PerPage;
                const end = start + PerPage;
                const members = role.members.map(x => x).map((m, i) => `${++i}. ${m.user.tag} - (${m.id})`).slice(start, end).join('\n');
                const embed = new EmbedBuilder()
                    .setTitle('List of users in Role')
                    .setDescription(members)
                    .setColor(Colors.Green)
                    .setFooter({ text: `${client.user.username} - Page ${i + 1}/${totalpages}`, iconURL: client.user.displayAvatarURL() });
                embeds.push(embed);
            }
            buttonPagination(message, embeds)
        } catch (error) {
            console.error(error);
            message.reply("An error occurred while listing members in the role.");
        }
    }
}
