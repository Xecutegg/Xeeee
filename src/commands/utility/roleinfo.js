import { EmbedBuilder } from 'discord.js';
import resolveRole from '../../utils/resolveRole.js';

export default {
    name: "roleinfo",
    description: "Displays information about a role in the server.",
    usage: "<role mention or role name>",
    category: "utility",
    aliases: ["roleinfo", "ri"],
    botperms: ["EmbedLinks", "AttachFiles"],
    async execute(client, message, args) {
        if (!args[0]) {
            return message.reply("Please provide a role name or mention.");
        }

        // Resolve the role using the provided argument
        const role = await resolveRole(message, args[0]);
        let guildRole = message.guild.roles.cache.find(r => r.name.includes(role.name) || r.id === role.id);

        if (!guildRole) {
            return message.reply("I couldn't find that role.");
        }

        // Create the embed for role information
        const roleInfoEmbed = new EmbedBuilder()
            .setTitle(`Role Information: ${guildRole.name}`)
            .setColor(guildRole.hexColor)
            .addFields(
                { name: "Name", value: guildRole.name, inline: true },
                { name: "ID", value: guildRole.id, inline: true },
                { name: "Created At", value: guildRole.createdAt.toLocaleString(), inline: true },
                { name: "Hoisted", value: guildRole.hoist ? "Yes" : "No", inline: true },
                { name: "Mentionable", value: guildRole.mentionable ? "Yes" : "No", inline: true },
                { name: "Hex Color", value: guildRole.hexColor, inline: true },
                { name: "Members", value: `${guildRole.members.size}`, inline: true },
                { name: "Position", value: `${guildRole.position}`, inline: true },
                { name: "Permissions", value: guildRole.permissions.toArray().join(", "), inline: false }
            )
            .setThumbnail(guildRole.iconURL())
        // Send the embed as an object
        message.reply({ embeds: [roleInfoEmbed] });
    }
}
