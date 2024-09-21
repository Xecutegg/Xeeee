import clientConfig from "../../database/models/clientConfig.js";
import resolveUser from "../../utils/resolveUser.js"; // Assuming resolveUser is a utility function to get user info

export default {
    name: "block-user",
    aliases: ["block-user"],
    description: "Blocks a user from using the bot.",
    usage: "<@user> <reason>",
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    devOnly: true,
    category: "admin",
    async execute(client, message, args) {
        if (args.length < 2) {
            return message.reply(`Usage: \`${this.usage}\``);
        }

        try {
            const user = await resolveUser(args[0]);
            if (!user) {
                return message.reply("User not found.");
            }

            const reason = args.slice(1).join(' ');
            let config = await clientConfig.findOne({});
            if (!config) {
                config = new clientConfig({
                    blocklistusers: []
                });
                await config.save();
            }

            const alreadyBlocked = config.blocklistusers.some(u => u.id === user.id);
            if (alreadyBlocked) {
                return message.reply("This user is already blocked.");
            }

            config.blocklistusers.push({
                id: user.id,
                reason: reason
            });

            await config.save();

            message.reply(`User ${user.tag} has been blocked for: ${reason}`);

        } catch (error) {
            console.error(error);
            message.reply("An error occurred while blocking the user. Please try again later.");
        }
    }
};
