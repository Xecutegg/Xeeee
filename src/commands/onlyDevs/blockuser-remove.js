import clientConfig from "../../database/models/clientConfig.js";
import resolveUser from "../../utils/resolveUser.js"; // Assuming resolveUser is a utility function to get user info

export default {
    name: "blockuserremove",
    aliases: ["block-user-remove"],
    description: "Removes a user from the blocklist.",
    usage: "<@user>",
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    devOnly: true,
    category: "admin",
    async execute(client, message, args) {
        if (args.length < 1) {
            return message.reply(`Usage: \`${this.usage}\``);
        }

        try {
            const user = await resolveUser(args[0]);
            if (!user) {
                return message.reply("User not found.");
            }

            const config = await clientConfig.findOne({ 'blocklistusers.id': user.id });
            if (!config) {
                return message.reply("This user is not blocked.");
            }

            await clientConfig.updateOne(
                {},
                {
                    $pull: {
                        blocklistusers: { id: user.id }
                    }
                }
            );

            message.reply(`User ${user.tag} has been removed from the blocklist.`);

        } catch (error) {
            console.error(error);
            message.reply("An error occurred while removing the user from the blocklist. Please try again later.");
        }
    }
};
