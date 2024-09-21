import { EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'phaser',
    description: 'Applies a Phaser Filter',
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: 'Filters',
    inVc: true,
    sameVc: true,
    player: true,
    async execute(client, message, args) {
        const player = client.poru.players.get(message.guild.id);
        player.filters.clearFilters();
        player.filters.setPhaser({
            rate: 1.0,
            depth: 0.5
        });
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription('**Phaser** mode is now enabled.');
        message.channel.send({ embeds: [embed] });
    },
};
