export default {
    name: 'volume',
    args: true,
    inVc: true,
    sameVc: true,
    player: true,
    current: true,
    aliases: ['v'],
    category: "music",
    async execute(client, message, args) {
        const player = client.poru.players.get(message.guild.id);
        if (isNaN(args[0])) {
            return message.channel.send(`Volume must be a number.`);
        }
        if (args[0] < 0 || args[0] > 100) {
            return message.reply('Volume must be between 0 and 100.');
        }
        player.setVolume(args[0]);
        message.reply(`Volume has been set to **${args[0]}%**.`);
    },
};