import { Colors, EmbedBuilder } from "discord.js";
import ms from "ms"
export default {
    name: 'nowplaying',
    description: 'Shows the currently playing song.',
    inVc: true,
    sameVc: true,
    player: true,
    current: true,
    aliases: ['np'],
    category: "music",
    async execute(client, message) {
        const player = client.poru.players.get(message.guild.id);

        // Get the currently playing track
        const track = player.currentTrack;

        // Create an embed message to display the track information
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)  // Set the embed color
            .setTitle('🎶 Now Playing')
            .setDescription(`[${track.info.title}](${track.info.uri})`)
            .addFields(
                { name: 'Author', value: track.info.author, inline: true },
                { name: 'Duration', value: ms(track.info.length), inline: true },
                { name: "Loop", value: player.loop, inline: true },
                { name: "Track Status", value: player.isPlaying ? 'playing' : 'paused', inline: true },            )
            .setThumbnail(track.info.artworkUrl)  // Assuming thumbnail is available in track.info
            .setFooter({ text: `Requested by ${track.info.requester.tag}`, iconURL: track.info.requester.displayAvatarURL() });

        // Send the embed to the channel
        return message.reply({ embeds: [embed] });

    }
}