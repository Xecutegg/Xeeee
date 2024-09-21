import { EmbedBuilder, Colors } from 'discord.js';
export default {
    name: 'ping',
    description: 'Replies with Pong!',
    category: "utility",
    botperms: ['SendMessage'],
    async execute(client, message, args) {
        const embed = new EmbedBuilder()
            .setTitle('Pong!')
            .setColor(Colors.Green)
            .setDescription(`API Latency: ${Math.floor(message.client.ws.ping)}ms`);

        message.reply({ embeds: [embed] });
    },
};
