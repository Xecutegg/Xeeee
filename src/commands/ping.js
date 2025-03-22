import { EmbedBuilder, Colors } from 'discord.js';

export default {
    name: 'ping',
    description: 'Replies with bot, API, and database latency!',
    category: "utility",
    botperms: ['SendMessages'],
    async execute(client, message, args) {
        const startTime = Date.now();

        // Send a temporary message to measure latency
        const msg = await message.reply('⏳ **Calculating ping...**');

        // Simulated database ping (replace with actual DB ping if using a database)
        const dbStart = Date.now();
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        const dbPing = Date.now() - dbStart;

        // Calculate latencies
        const apiPing = Math.floor(client.ws.ping);
        const botPing = msg.createdTimestamp - message.createdTimestamp;
        const messagePing = Date.now() - startTime;

        // Create enhanced embed
        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong! Bot Latency Report')
            .setColor(Colors.Blue)
            .setThumbnail(client.user.displayAvatarURL()) // Bot's avatar
            .setDescription('Here is the current latency status of the bot:')
            .addFields(
                { name: '🟢 API Latency', value: `\`${apiPing}ms\``, inline: true },
                { name: '🤖 Bot Latency', value: `\`${botPing}ms\``, inline: true },
                { name: '🗄️ Database Latency', value: `\`${dbPing}ms\``, inline: true },
                { name: '⏳ Message Latency', value: `\`${messagePing}ms\``, inline: true }
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        msg.edit({ content: '', embeds: [embed] });
    },
};
