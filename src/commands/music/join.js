export default {
    name: 'join',
    inVc: true,
    aliases: ['connect'],
    category: "music",
    async execute(client, message, args) {
        client.poru.createConnection({
            guildId: message.guild.id,
            voiceChannel: message.member.voice.channel.id,
            textChannel: message.channel.id,
            deaf: true,
        });

        message.reply(`Joined ${message.member.voice.channel.toString()}.`);
    },
};