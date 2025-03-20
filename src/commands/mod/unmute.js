import resolveUser from '../../utils/resolveUser.js';

export default {
    name: "unmute",
    description: "Removes the timeout from a specified user.",
    usage: "<user mention or user ID> [reason]",
    category: "moderation",
    aliases: ["untimeout", "remove-timeout"],
    userperms: ['ModerateMembers'],
    botperms: ["ModerateMembers"],
    async execute(client, message, args) {
        try {
            if (!args[0]) return message.reply("Please provide a user mention or ID.");

            const user = await resolveUser(args[0]);
            console.log(`Resolved user:`, user);

            if (!user) return message.reply("User not found. Please provide a valid user mention or ID.");
            
            // Ensure user is a GuildMember
            const member = await message.guild.members.fetch(user.id).catch(() => null);
            if (!member) return message.reply("User is not in this server.");

            console.log(`Checking timeout status for ${member.user.tag}`);

            // Check if the user is timed out
            if (!member.communicationDisabledUntilTimestamp || member.communicationDisabledUntilTimestamp < Date.now()) {
                return message.reply(`${member.user.tag} is not currently timed out.`);
            }

            // Get reason from arguments (default if not provided)
            const reason = args.slice(1).join(" ") || "No reason provided";

            // Remove timeout
            await member.timeout(null, `Timeout removed by ${message.author.tag} | Reason: ${reason}`);
            message.reply(`${member.user.tag} has been unmuted (timeout removed). Reason: **${reason}**`);

            // Send DM notification
            try {
                await member.send(`You have been unmuted in **${message.guild.name}**.\n**Reason:** ${reason}`);
            } catch (dmError) {
                console.error(`Could not send DM to ${member.user.tag}: ${dmError.message}`);
            }

        } catch (error) {
            console.error(`Error executing unmute command: ${error}`);
            return message.reply('An error occurred while processing the command.');
        }
    }
};
