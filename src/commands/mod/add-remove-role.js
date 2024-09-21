import { Colors } from 'discord.js';
import resolveUser from '../../utils/resolveUser.js';
export default {
    name: 'role',
    description: 'Assigns or removes a role from multiple users. If the user already has the role, it will be removed; otherwise, it will be added.',
    usage: '<@role> <@user1> <@user2> ...',
    category: 'moderation',
    userperms: ['ManageRoles'],
    botperms: ['ManageRoles'],
    async execute(client, message, args) {
        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply("You don't have permission to use this command.");
        }
        if (!message.guild.members.me.permissions.has('ManageRoles')) {
            return message.reply("I don't have permission to manage roles.");
        }
        if (args.length < 2) return message.reply('Please provide a role and at least one user.');

        const roleMention = args[0];
        const role = message.mentions.roles.first()
            || message.guild.roles.cache.find(v => v.id === roleMention || v.name.toLowerCase() === roleMention.toLowerCase());

        if (!role) return message.reply('Please mention a valid role.');

        const result = {
            added: [],
            removed: [],
            failed: []
        };

        for (let i = 1; i < args.length; i++) {
            const userArg = args[i];
            const user = await resolveUser(userArg);

            if (!user) {
                result.failed.push(userArg);
                continue;
            }

            const member = await message.guild.members.fetch(user.id).catch(() => null);
            if (!member) {
                result.failed.push(userArg);
                continue;
            }

            if (member.roles.cache.has(role.id)) {
                try {
                    await member.roles.remove(role);
                    result.removed.push(member.user.tag);
                } catch (error) {
                    result.failed.push(member.user.tag);
                }
            } else {
                try {
                    await member.roles.add(role);
                    result.added.push(member.user.tag);
                } catch (error) {
                    result.failed.push(member.user.tag);
                }
            }
        }

        const embed = {
            color: Colors.Green,
            title: 'Role Toggle Result',
            fields: []
        };

        if (result.added.length) {
            embed.fields.push({
                name: 'Role Added',
                value: result.added.join(', '),
                inline: false
            });
        }

        if (result.removed.length) {
            embed.fields.push({
                name: 'Role Removed',
                value: result.removed.join(', '),
                inline: false
            });
        }

        if (result.failed.length) {
            embed.fields.push({
                name: 'Failed',
                value: result.failed.join(', '),
                inline: false
            });
        }

        if (!embed.fields.length) {
            embed.description = 'No users were processed.';
        }

        message.reply({ embeds: [embed] });
    }
};
