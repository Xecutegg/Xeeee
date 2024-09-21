import { Message, PermissionFlagsBits, Client, EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'rate',
    description: 'Rates Up The Song',
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

        if (!args.length) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription('Enter The Rate Limit between < 0.1 - 2.0 >')
                ]
            });
        }

        if (isNaN(args[0])) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription('Enter A Valid Rate')
                ]
            });
        }

        const rate = Number(args[0]);

        if (rate > 2 || rate <= 0) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription('Rate must be between 0.1 and 2.0')
                ]
            });
        }

        player.filters.setTimescale({
            speed: 1.0,
            pitch: 1.0,
            rate: rate
        });

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`Rate Set To **${rate}**`);
        message.channel.send({ embeds: [embed] });
    },
};
