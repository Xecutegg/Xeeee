import { Message, PermissionFlagsBits, Client, EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'nightcore',
    description: 'Applies a Nightcore Filter',
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: 'Filters',
    cooldown: 10,
    player: true,
    inVc: true,
    sameVc: true,
    async execute(client, message, args) {
        const player = client.poru.players.get(message.guild.id);
        player.filters.clearFilters();
        player.filters.setTimescale({
            speed: 1.165,
            pitch: 1.125,
            rate: 1.05
        });
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription('**Nightcore** mode is now enabled.');
        message.channel.send({ embeds: [embed] });
    },
};
