export default {
    name: "setprefix",
    description: "Sets or returns the current prefix for the bot.",
    usage: "setprefix <prefix>",
    userperms: ['Administrator'],
    botperms: ['Administrator'],
    category: "moderation",
    async execute(client, message, args) {
        try {
            let prefix = args[0];

            if (!prefix) {
                const currentPrefix = client.prefixCache.get(message.guild.id) || client.prefix;
                return message.reply(`The current prefix is \`${currentPrefix}\`.`);
            }

            if (prefix.length > 2) {
                return message.reply("Prefix length is invalid, must be at most 2 characters.");
            }
            client.prefix = prefix;
            await client.db.Guild.findOneAndUpdate(
                { guildId: message.guild.id },
                { prefix: prefix },
                { new: true, upsert: true }
            );
            message.reply(`Prefix has been set to \`${prefix}\`.`);
        } catch (error) {
            console.error(`Error in setprefix command: ${error.message}`);
            message.reply("An error occurred while setting the prefix.");
        }
    }
};
