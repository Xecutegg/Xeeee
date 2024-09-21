import { radeon } from "../../index.js";

export default {
    name: "trackStart",
    description: "Track when a user starts playing a song.",
    async run(player, track) {
        try {
            const channel = await radeon.channels.cache.get(player.textChannel);
            if (!channel) return;

            const title = track.info.title || 'Unknown Title';
            const requester = track.info.requester?.username || 'Unknown User';

            let msg = await channel.send(`**Now Playing:** \`${title}\` - by \`${requester}\``);
            player.message = msg;
        } catch (error) {
            console.error("Error in trackStart:", error);
        }
    }
};
