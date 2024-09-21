import { Message, PermissionFlagsBits, Client, EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'china',
    description: 'Applies a China Filter',
    userPermissions: [PermissionFlagsBits.SendMessages],
    botPermissions: [PermissionFlagsBits.SendMessages],
    category: 'Filters',
    inVc: true,
    sameVc: true,
    player: true,
    current: true,
    async execute(client, message, args) {
        const player = client.poru.players.get(message.guild.id);
        player.filters.clearFilters();
        player.filters.setTimescale({
            speed: 0.75,
            pitch: 1.25,
            rate: 1.15
        });
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription('**China** mode is now enabled.');
        message.channel.send({ embeds: [embed] });
    },
};
