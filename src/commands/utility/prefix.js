export default {
    name: "prefix",
    description: "Returns the current prefix for the bot.",
    usage: "<prefix>",
    category: "utility",
    execute(client, message, args) {
        message.reply(`My current prefix is: ${client.prefix}`);
    }
}