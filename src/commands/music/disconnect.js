import { radeon } from "../../index.js";

export default {
    name: 'disconnect',
    inVc: true,
    sameVc: true,
    player: true,
    aliases: ['dc'],
    category: "music",
    async execute(client, message, args) {
        const player = radeon.poru.players.get(message.guild.id);

        if (!player) {
            return message.reply("❌ No active player found in this server.");
        }

        player.destroy();
        return message.reply("✅ Disconnected the player.");
    },
};
