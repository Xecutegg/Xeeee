export default  {
    name: 'skip',
    inVc: true,
    sameVc: true,
    player: true,
    current: true,
    aliases: ['s'],
    category: "music",
    async execute(client, message, args){
      const player = client.poru.players.get(message.guild.id);
      player.skip();
      message.reply('Skipped the current track.');
    },
  };