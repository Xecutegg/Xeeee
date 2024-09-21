import { EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'reverb',
    description: 'Applies a Reverb Filter',
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: 'Filters',
    inVc: true,
    sameVc: true,
    player: true,
    async execute(client, message, args) {
        const player = client.poru.players.get(message.guild.id);
        player.filters.clearFilters();
        player.filters.setReverb({
            decay: 0.5,
            mix: 0.3
        });
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription('**Reverb** mode is now enabled.');
        message.channel.send({ embeds: [embed] });
    },
};
