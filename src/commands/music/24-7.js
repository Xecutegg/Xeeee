export default {
    name: "247",
    description: "24/7 music bot",
    usage: "cmdname [options = enable or disable]",
    botperms: ['SendMessages'],
    userperms: ['ManageMessages'],
    inVc: true,
    sameVc: true,
    player: true,
    aliases: ['27/4'],
    category: "music",
    async execute(client, message, args) {
        if (!args[0]) {
            return message.reply("Please specify whether you want to enable or disable the 24/7 music bot.");
        }
        if (args[0].toLowerCase() === 'enable') {
            await client.db.Guild.findOneAndUpdate({ guildId: message.guild.id }, {
                $set: { is247: true }
            });
            message.reply("The 24/7 music bot has been enabled.");
        }
        if (args[0].toLowerCase() === 'disable') {
            await client.db.Guild.findOneAndUpdate({ guildId: message.guild.id }, {
                $set: { is247: false }
            });
            message.reply("The 24/7 music bot has been disabled.");
        }
    }
}