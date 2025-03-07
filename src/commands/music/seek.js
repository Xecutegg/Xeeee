export default {
  name: 'seek',
  args: true,
  inVc: true,
  sameVc: true,
  player: true,
  current: true,
  aliases: ['st'],
  category: "music",
  async execute(client, message, args) {
    const player = client.poru.players.get(message.guild.id);

    if (!player.currentTrack.info.isSeekable) {
      return message.reply('This track is not seekable.');
    }

    player.seekTo(args[0] * 1000);

    message.reply(`Seeked ${args[0]}s`);
  },
};