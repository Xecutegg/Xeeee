import resolveUser from '../../utils/resolveUser.js';

export default {
    name: "unmute",
    description: "Removes the timeout from a specified user.",
    usage: "<user mention or user ID>",
    category: "moderation",
    aliases: ["untimeout", "remove-timeout"],
    userperms: ['ModerateMembers'],
    botperms: ["ModerateMembers"],
    async execute(client, message, args) {
        try {
            if (!args[0]) return message.reply("Please provide a user mention or ID.");

            const user = await resolveUser(args[0]);
            if (!user) return message.reply("User not found. Please provide a valid user mention or ID.");
            if (!user.isCommunicationDisabled()) {
                return message.reply(`${user.user.tag} is not currently timed out.`);
            }
            await user.timeout(null);
            return message.reply(`${user.user.tag} has been unmuted (timeout removed).`);

        } catch (error) {
            console.error(`Error executing unmute command: ${error.message}`);
            return message.reply('An error occurred while processing the command.');
        }
    }
};
