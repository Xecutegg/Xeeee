import { EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'distortion',
    description: 'Applies a Distortion Filter',
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: 'Filters',
    inVc: true,
    sameVc: true,
    player: true,
    async execute(client, message, args) {
        const player = client.poru.players.get(message.guild.id);
        player.filters.clearFilters();
        player.filters.setDistortion({
            amount: 0.5,
            blend: 0.5
        });
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription('**Distortion** mode is now enabled.');
        message.channel.send({ embeds: [embed] });
    },
};
