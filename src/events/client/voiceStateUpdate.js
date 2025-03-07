import { processQuery } from "../../commands/music/play.js";
import { radeon as client } from "../../index.js";

export default {
    name: 'voiceStateUpdate',
    async run(oldVoice, newVoice) {
        try {
            const player = await client.poru.players.get(oldVoice.guild.id);
            if (!player) return;

            const botVoiceChannel = newVoice.guild.members.me.voice.channel;
            if (!botVoiceChannel) {
                const channel = await client.channels.fetch(player.textChannel);
                const guildId = channel.guild.id;
                const guilddDB = await client.db.Guild.findOne({ guildId: guildId });
                const is247 = guilddDB.is247;
                if (is247) {
                    let trackCount = 0;
                    let playlistCount = 0;
                    let pretracks = player.queue.map(track => track.info.uri);
                    await player.destroy();
                    const newPlayer = client.poru.createConnection({
                        guildId: guildId,
                        voiceChannel: oldVoice.channelId,
                        textChannel: channel.id,
                        deaf: true
                    });

                    newPlayer.setTextChannel(channel.id);

                    for (const uri of pretracks) {
                        try {
                            const resolve = await client.poru.resolve(await processQuery(uri));
                            const { loadType, tracks, playlistInfo } = resolve;

                            if (loadType === 'playlist') {
                                tracks.forEach(async (track) => {
                                    track.info.requester = await client.user;
                                    newPlayer.queue.add(track);
                                });
                                playlistCount++;
                            } else if (loadType === 'search' || loadType === 'track') {
                                const track = tracks[0];
                                track.info.requester = await client.user;
                                newPlayer.queue.add(track);
                                trackCount++;
                            } else {
                                // Handle cases where no results are found, if needed
                            }
                        } catch (error) {
                            console.error(`Error resolving track with URI ${uri}`, error);
                        }
                    }

                    if (trackCount > 0 || playlistCount > 0) {
                        await channel.send(
                            `Re-added ${trackCount} track(s) and ${playlistCount} playlist(s) from the previous session. Resuming play due to 24/7 mode being enabled.`
                        );
                    }

                    if (!newPlayer.isPlaying && !newPlayer.isPaused) {
                        newPlayer.play();
                    }
                } else {
                    await player.destroy();
                }
            }
        } catch (error) {
            console.error("Error in voiceStateUpdate:", error);
        }
    }
};
