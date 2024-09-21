import { Colors, EmbedBuilder } from 'discord.js';
import resolveRole from '../../../utils/resolveRole.js'
import { buttonPagination } from '../../../utils/buttonPaginater.js';
export default {
    name: "listrole",
    description: "List all roles in guild",
    usage: "No args required",
    category: "utility",
    botperms: ["SendMessage"],
    async execute(client, message, args) {
        try {
            let roles = await message.guild.roles.fetch();
            const PerPage = 10;
            const totalpages = Math.ceil(roles.size / PerPage);
            const embeds = [];
            for (let i = 0; i < totalpages; i++) {
                const start = i * PerPage;
                const end = start + PerPage;
                const role = roles.map(x => x).map((m, i) => `${++i}. ${m} - (${m.id})`).slice(start, end).join('\n');
                const embed = new EmbedBuilder()
                    .setTitle('List of Roles in Server')
                    .setDescription(role)
                    .setColor(Colors.Green)
                    .setFooter({ text: `${client.user.username} - Page ${i + 1}/${totalpages}`, iconURL: client.user.displayAvatarURL() });
                embeds.push(embed);
            }
            buttonPagination(message, embeds)
        } catch (error) {
            console.error(error);
            message.reply("An error occurred while fetching the roles");
        }
    }
}
