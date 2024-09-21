import { EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'echo',
    description: 'Applies an Echo Filter',
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: 'Filters',
    inVc: true,
    sameVc: true,
    player: true,
    async execute(client, message, args) {
        if (!args[0] || !args[1]) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription('Please provide both `delay` and `feedback` values.')
                ]
            });
        }

        const delay = parseInt(args[0], 10);
        const feedback = parseFloat(args[1]);

        if (isNaN(delay) || isNaN(feedback)) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription('Invalid values for `delay` or `feedback`.')
                ]
            });
        }

        const player = client.poru.players.get(message.guild.id);
        player.filters.clearFilters();
        player.filters.setEcho({
            delay,
            feedback
        });

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`**Echo** mode is now enabled with delay ${delay}ms and feedback ${feedback}.`);
        message.channel.send({ embeds: [embed] });
    },
};
