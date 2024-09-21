import { EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'lowpass',
    description: 'Applies a Lowpass Filter',
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: 'Filters',
    inVc: true,
    sameVc: true,
    player: true,
    async execute(client, message, args) {
        if (!args[0]) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription('Please provide a frequency value.')
                ]
            });
        }

        const frequency = parseInt(args[0], 10);

        if (isNaN(frequency)) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription('Invalid frequency value.')
                ]
            });
        }

        const player = client.poru.players.get(message.guild.id);
        player.filters.clearFilters();
        player.filters.setLowpassFilter({
            frequency
        });

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`**Lowpass** filter applied with frequency ${frequency}Hz.`);
        message.channel.send({ embeds: [embed] });
    },
};
