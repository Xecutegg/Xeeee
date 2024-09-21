import { Message, PermissionFlagsBits, Client, EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'speed',
    description: 'Speeds Up The Song',
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: 'Filters',
    cooldown: 10,
    player: true,
    inVc: true,
    sameVc: true,
    async execute(client, message, args) {
        const player = client.poru.players.get(message.guild.id);

        if (!args.length) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription('Enter The Speed Limit between < 0.1 - 2.0 >')
                ]
            });
        }

        if (isNaN(args[0])) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription('Enter A Valid Speed')
                ]
            });
        }

        const speed = Number(args[0]);

        if (speed > 2 || speed <= 0) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription('Enter The Speed Limit between < 0.1 - 2.0 >')
                ]
            });
        }

        player.filters.clearFilters();
        player.filters.setTimescale({
            speed: speed,
            pitch: 1.0,
            rate: 1.0
        });

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`Speed Set To **${speed}**`);
        message.channel.send({ embeds: [embed] });
    },
};
