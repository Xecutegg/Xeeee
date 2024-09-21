import { Message, PermissionFlagsBits, Client, EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'clearfilters',
    description: 'Clears all filters',
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: 'Filters',
    cooldown: 10,
    aliases: ['cf'],
    player: true,
    inVc: true,
    sameVc: true,
    async execute(client, message, args) {
        const player = client.poru.players.get(message.guild.id);
        player.filters.clearFilters();
        player.filters.setTimescale({
            speed: 1.0,
            pitch: 1.0,
            rate: 1.0
        });
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription('**Cleared all the filters.**');
        message.channel.send({ embeds: [embed] });
    },
};
