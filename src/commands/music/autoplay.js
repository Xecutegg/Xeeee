export default {
    name: 'autoplay',
    description: 'Automatically plays music when the bot joins a voice channel.',
    inVc: true,
    sameVc: true,
    player: true,
    current: true,
    aliases: ['ap'],
    category: "music",
    async execute(client, message, args) {
        const player = client.poru.players.get(message.guild.id);
        let currentStatus = player.isAutoPlay;
        player.autoplay();
        message.reply(`Autoplay ${!currentStatus ? "Enabled" : "Disabled"}`);
    }
}