import { Message, PermissionFlagsBits, Client, EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'chipmunk',
    description: 'Applies a Chipmunk Filter',
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: 'Filters',
    inVc: true,
    sameVc: true,
    player: true,
    async execute(client, message, args) {
        const player = client.poru.players.get(message.guild.id);
        player.filters.clearFilters();
        player.filters.setTimescale({
            speed: 1.05,
            pitch: 1.35,
            rate: 1.25
        });
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription('**Chipmunk** mode is now enabled.');
        message.channel.send({ embeds: [embed] });
    },
};
