import { EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'bitcrusher',
    description: 'Applies a Bitcrusher Filter',
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: 'Filters',
    inVc: true,
    sameVc: true,
    player: true,
    async execute(client, message, args) {
        const player = client.poru.players.get(message.guild.id);
        player.filters.clearFilters();
        player.filters.setBitcrusher({
            bits: 8,
            volume: 0.5
        });
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription('**Bitcrusher** mode is now enabled.');
        message.channel.send({ embeds: [embed] });
    },
};
