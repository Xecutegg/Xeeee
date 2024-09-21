import { radeon } from "../../index.js";
export default {
    name: 'play',
    description: 'Plays a song or playlist from YouTube.',
    usage: '<song or playlist URL>',
    examples: ['play https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'play playlist/PLlRxD0HuuGeS24v_peXus9mBw53Q_sI1f'],
    aliases: ['p'],
    cooldown: 5,
    inVc: true,
    sameVc: true,
    args: true,
    category: "music",
    async execute(client, message, args) {
        if (!args.join(' ')) {
            return message.reply('Please provide a song or playlist URL.');
        }
        const player = radeon.poru.createConnection({
            guildId: message.guild.id,
            voiceChannel: message.member.voice.channel.id,
            textChannel: message.channel.id,
            deaf: true
        });
        player.setTextChannel(message.channel.id);
        let result = processQuery(args.join(' '))
        if (!result) return message.reply('No results found.');
        const resolve = await radeon.poru.resolve(result);
        const { loadType, tracks, playlistInfo } = resolve;
        if (loadType === 'playlist') {
            for (const track of resolve.tracks) {
                track.info.requester = message.author;
                player.queue.add(track);
            }

            message.channel.send(
                `Added: \`${tracks.length} from ${playlistInfo.name}\``,
            );
            if (!player.isPlaying && !player.isPaused) return player.play();
        } else if (loadType === 'search' || loadType === 'track') {
            const track = tracks.shift();
            track.info.requester = message.author;
            player.queue.add(track);
            message.channel.send(`Added: \`${track.info.title}\` to queue.`);
            if (!player.isPlaying && !player.isPaused) return player.play();
        } else {
            return message.channel.send('There are no results found.');
        }
    },
};

export function processQuery(query) {
    // Regular expressions to match YouTube and Spotify URLs
    const ytRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const spRegex = /^(?:https?:\/\/)?(?:open\.spotify\.com\/(?:track|album|playlist)\/|spotify:track:)([a-zA-Z0-9]{22})/;
    let source;
    let match;
    match = query.match(ytRegex);
    if (match) {
        // Extract the video ID
        query = match[1];
        source = 'ytsearch';
        return { query, source };
    }

    match = query.match(spRegex);
    if (match) {
        query = query;
        source = 'spsearch';
        return { query, source };
    }

    source = 'ytsearch';
    console.log({ query, source });
    
    return { query, source };
}
