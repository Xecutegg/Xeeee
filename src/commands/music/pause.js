import { radeon } from "../../index.js";

export default {
    name: 'pause',
    inVc: true,
    sameVc: true,
    player: true,
    current: true,
    category: "music",
    async execute(client, message, args) {
        const player = radeon.poru.players.get(message.guild.id);
        if (player.isPaused) {
            message.reply('Player is already paused.');
        } else {
            player.pause(true);
            message.reply('Paused the player.');
        }
    },
};