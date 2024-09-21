import { Message, PermissionFlagsBits, Client, EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'bassboost',
    description: 'Applies a Bassboost Filter',
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
        player.filters.setEqualizer([
            { band: 0, gain: 1.5 },
            { band: 1, gain: 1.5 },
            { band: 2, gain: 1.5 },
            { band: 3, gain: 1.0 },
            { band: 4, gain: 0.5 }
        ]);

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription('**Bassboost** mode is now enabled.');
        message.channel.send({ embeds: [embed] });
    },
};
