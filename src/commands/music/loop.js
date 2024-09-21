export default {
    name: 'loop',
    inVc: true,
    sameVc: true,
    player: true,
    current: true,
    aliases: ['lp'],
    category: "music",
    async execute(client, message, args) {
        // Loop mode: 0=Current Track, 1=Queue loop, 2=Disable Loop
        if (!args[0]) return message.reply('Please provide loop mode \`0=Current Track | 1=Queue loop | 2=Disable Loop\`')
        if (isNaN(args[0])) return message.reply(`Plese be provide loop mode in numbers`)
        let loopMode = parseInt(args[0])
        const player = client.poru.players.get(message.guild.id);
        if (loopMode === 0) {
            player.setLoop('TRACK');
            return message.reply('Loop track enabled');
        } else if (loopMode === 1) {
            player.setLoop('QUEUE');
            return message.reply('Loop queue enabled');
        } else if (loopMode === 2) {
            player.setLoop('NONE');
            return message.reply('Loop disabled');
        }
    },
};