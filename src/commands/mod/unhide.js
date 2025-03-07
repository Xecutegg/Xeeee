import resolveRoleOrUser from '../../utils/resolveRoleOrUser .js';

export default {
    name: "unhide",
    description: "Shows (unlocks) a specified channel or the current channel for a specified role or user, or for everyone if no role or user is provided.",
    usage: "[channel mention or name] [role mention or user mention or name]",
    category: "moderation",
    userperms: ['ManageChannels'],
    botperms: ["ManageChannels"],
    async execute(client, message, args) {
        try {
            let channel;
            let roleOrUser;

            if (args[0]) {
                channel = await resolveChannel(message, args[0]);
                if (!channel) return message.reply("Channel not found. Please provide a valid channel mention or name.");
            } else {
                channel = message.channel;
            }

            if (args[1]) {
                roleOrUser = await resolveRoleOrUser(message, args[1]);
                if (!roleOrUser) return message.reply("Role or user not found. Please provide a valid role or user mention, ID, or name.");
            }

            if (roleOrUser) {
                await channel.permissionOverwrites.edit(roleOrUser.id, { ViewChannel: true });
                return message.reply(`Successfully unhide ${channel.name} for ${roleOrUser.name || roleOrUser.user.tag}.`);
            } else {
                await channel.permissionOverwrites.edit(message.guild.id, { ViewChannel: true });
                return message.reply(`Successfully unhide ${channel.name} for everyone.`);
            }
        } catch (error) {
            console.error(`Error executing unhide command: ${error.message}`);
            return message.reply('An error occurred while processing the command.');
        }
    }
};
