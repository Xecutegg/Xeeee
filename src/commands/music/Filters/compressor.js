import { EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'compressor',
    description: 'Applies a Compressor Filter',
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: 'Filters',
    inVc: true,
    sameVc: true,
    player: true,
    async execute(client, message, args) {
        const player = client.poru.players.get(message.guild.id);
        player.filters.clearFilters();
        player.filters.setCompressor({
            threshold: -20,
            ratio: 4
        });
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription('**Compressor** mode is now enabled.');
        message.channel.send({ embeds: [embed] });
    },
};
