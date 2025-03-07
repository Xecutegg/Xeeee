import clientConfig from "../../database/models/clientConfig.js";
import resolveUser from "../../utils/resolveUser.js";

export default {
    name: "np-remove",
    description: "Remove non-prefix from user.",
    usage: "np-remove user",
    devOnly: true,
    async execute(client, message, args) {
        let botconfig = await clientConfig.findOne();
        if (!args[0]) return message.reply('Please provide a user to remove.');
        const user = await resolveUser(args[0], client);
        
        if (!user) return message.reply('User not found.');
        if (!botconfig.np_users.includes(user.id)) return message.reply('User does not have a non-prefixed badge.');
        
        botconfig.np_users.pull(user.id);
        await botconfig.save();
        return message.reply(`${user.tag} has been removed from the non-prefixed users.`);
    }
}
