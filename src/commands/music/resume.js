export default {
    name: 'resume',
    inVc: true,
    sameVc: true,
    player: true,
    category: "music",
    async execute(client, message, args){
      const player = client.poru.players.get(message.guild.id);
      if (!player.isPaused) {
        message.reply('Player is not paused.');
      } else {
        player.pause(false);
        message.reply('Resumed the player.');
      }
    },
  };