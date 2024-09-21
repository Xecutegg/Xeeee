import { EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'vibrato',
    description: 'Applies a Vibrato Filter',
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: 'Filters',
    inVc: true,
    sameVc: true,
    player: true,
    async execute(client, message, args) {
        const player = client.poru.players.get(message.guild.id);
        player.filters.clearFilters();
        player.filters.setVibrato({
            rate: 5.0,
            depth: 0.5
        });
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription('**Vibrato** mode is now enabled.');
        message.channel.send({ embeds: [embed] });
    },
};
