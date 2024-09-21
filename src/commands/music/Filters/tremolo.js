import { Message, PermissionFlagsBits, Client, EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'tremolo',
    description: 'Applies a Tremolo Filter',
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
            speed: 1.0,
            pitch: 1.0,
            rate: 1.0
        });
        player.filters.setTremolo({
            frequency: 4.0,
            depth: 0.75
        });

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription('**Tremolo** mode is now enabled.');
        message.channel.send({ embeds: [embed] });
    },
};
