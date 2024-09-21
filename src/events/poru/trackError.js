import { EmbedBuilder } from "discord.js";
import { radeon as client } from "../../index.js";
export default {
    name: "trackError",
    description: "Emitted when an error occurs while playing a track.",
    async run(player, track, error) {
        const embed = new EmbedBuilder()
            .setTitle(`${error.exception.message}`)
            .setDescription(`[${track.info.title}](${track.info.uri})`);

        const channel = client.channels.cache.get(player.textChannel);
        return channel?.send({ embeds: [embed] });
    }
}
