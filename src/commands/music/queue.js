import { Colors, EmbedBuilder } from "discord.js";
import ms from 'ms';
import { buttonPagination } from "../../utils/buttonPaginater.js";

export default {
  name: 'queue',
  inVc: true,
  sameVc: true,
  player: true,
  aliases: ['q'],
  category: "music",
  async execute(client, message, args) {
    const player = client.poru.players.get(message.guild.id);
    const queue = player.queue;

    if (!queue.length) return message.reply('The queue is empty');

    const tracksPerPage = 10;
    const totalpages = Math.ceil(queue.length / tracksPerPage);
    const embeds = [];

    for (let i = 0; i < totalpages; i++) {
      const start = i * tracksPerPage;
      const end = start + tracksPerPage;
      const tracks = queue.slice(start, end);

      const embed = new EmbedBuilder()
        .setColor(Colors.White)
        .setTitle('Now Playing')
        .setThumbnail(player.currentTrack.info.image)
        .setDescription(
          `[${player.currentTrack.info.title}](${player.currentTrack.info.uri}) [${ms(player.currentTrack.info.length)}]`
        )
        .setFooter({ text: `Page ${i + 1} of ${totalpages} • Queue length: ${player.queue.length} tracks` });

      embed.addFields([
        {
          name: 'Up Next',
          value: tracks
            .map((track, index) => `**${start + index + 1}.)** \`${track.info.title}\``)
            .join('\n') || 'No more tracks in the queue.',
        },
      ]);

      embeds.push(embed);
    }
    buttonPagination(message, embeds)
  },
};
