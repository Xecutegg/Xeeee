import clientConfig from "../../database/models/clientConfig.js";
import resolveUser from "../../utils/resolveUser.js";

export default {
    name: "np-add",
    description: "Add non-prefix to user.",
    usage: "np-add user",
    async execute(client, message, args) {
        let botconfig = await clientConfig.findOne();
        console.log(botconfig)

        if (!args[0]) return message.reply('Please provide a user to add.');
        const user = await resolveUser(args[0], client);
        if (!user) return message.reply('User not found.');
        console.log(botconfig.np_users);
        
        if (botconfig.np_users.includes(user.id)) return message.reply('User is already non-prefixed.');
        botconfig.np_users.push(user.id);
        await botconfig.save();
        return message.reply(`${user.tag} has been added to the non-prefixed users.`);
    }
}
