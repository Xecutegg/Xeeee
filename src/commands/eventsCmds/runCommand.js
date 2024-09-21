import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, Colors, EmbedBuilder } from 'discord.js';
import { checkUserRoleInGuild } from '../../utils/hasRole.js'
import { applyCooldown } from '../../utils/cooldown.js';
import { isUserBlock } from '../../utils/isUserBloack.js';
export default {
    name: "MainCreate",
    isEvent: true,
    type: "messageCreate",
    async execute(client, message) {
        if (
            message.author.bot ||
            !message.guild ||
            message.system ||
            message.webhookId
        ) return;
        let data = await client.db.Guild.findOne({ guildId: message.guild.id });
        if (!data) {
            await client.db.Guild.create({ guildId: message.guild.id });
            data = await client.db.Guild.findOne({ guildId: message.guild.id });
        }

        if (message.content === `<@${client.user.id}>`) {
            //checking cooldown
            const canExecute = await applyCooldown(message, { name: "botmention", cooldown: 3 });
            if (!canExecute) return;
            //cooldown checking ended
            let b1 = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(`Invite`).setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=415602886720&scope=bot%20applications.commands`);
            let b2 = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(`Support`).setURL(`https://discord.gg/jbPACSKnjf`);
            let b3 = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(`Vote`).setURL(`https://dsc.gg/radeon`);
            let ro = new ActionRowBuilder().addComponents(b1, b2, b3);
            let embed = new EmbedBuilder().setColor(Colors.Green).setFooter({ text: `Made By Kishan ❤️`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setDescription(
                `__**Settings For ${message.guild.name}**__
                Server Id : \`${message.guild.id}\`
                Voice Channel : ${message.guild.members.me.voice.channel ? message.guild.members.me.voice.channel : "`Not Joined`"}
                Voice Channel Id : ${message.guild.members.me.voice.channel ? `\`${message.guild.members.me.voice.channelId}\`` : "`Not Joined`"}
                My prefix here : \`${data.prefix}\`
                
                Try me with this command - \`${data.prefix}help\``
            ).addFields({ name: `__Links__`, value: `[Support](https://discord.gg/jbPACSKnjf) | [Invite](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=415602886720&scope=bot%20applications.commands)` }).setAuthor({ name: `Hey I am ${client.user.username}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) }).setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            return message.channel.send({ embeds: [embed], components: [ro] }).catch((e) => { message.author.send({ content: `Error while sending message there : ${e.message}` }).catch(() => { }) })
        };

        let tagcheck = message.content.trim().split(/ +/);
        let mentionMatch = tagcheck[0].match(/^<@!?(\d+)>$/);
        let isMentioned = false;
        if (mentionMatch && mentionMatch[1] === client.user.id) {
            isMentioned = true;
            tagcheck.shift();
        }
        const isNonprefixUser = await checkUserRoleInGuild(client, '1217379405781925968', '1274652928367661138', message.author.id);
        if (!isNonprefixUser && !isMentioned && !message.content.startsWith(data.prefix)) {
            return;
        }

        let args;
        if (isNonprefixUser == false) {
            args = message.content.slice(data.prefix.length).trim().split(/ +/);
        } else if (message.content.startsWith(data.prefix) == true) {
            args = message.content.slice(data.prefix.length).trim().split(/ +/);
        } else {
            args = tagcheck;
        }

        const cmd = args.shift().toLowerCase();
        if (cmd.length === 0) return;
        let command = client.commands.get(cmd);
        if (!command) {
            command = client.commands.find(cmdObj => cmdObj.aliases && cmdObj.aliases.includes(cmd));
        }
        let devIds = ["841319721860988931"];
        if (!command) return;
        if (command.devOnly && !devIds.includes(message.author.id)) return;
        if (command.isEvent) return;
        //checking cooldown
        const UserBlock = await isUserBlock(message.author.id);
        if (UserBlock) return message.author.send("You are now blocked. Please contact my developers for more information.").catch(err => { })
        const canExecute = await applyCooldown(message, command);
        if (!canExecute) return;
        //cooldown checking ended
        if (command.userperms) {
            const missingUserPerms = command.userperms.filter(perm => !message.member.permissions.has(perm));
            if (missingUserPerms.length) {
                return message.reply(`You are missing the following permissions to use this command: ${missingUserPerms.join(', ')}`);
            }
        }

        if (command.botperms) {
            const missingBotPerms = command.botperms.filter(perm => !message.guild.members.me.permissions.has(perm));
            if (missingBotPerms.length) {
                return message.reply(`I am missing the following permissions to execute this command: ${missingBotPerms.join(', ')}`);
            }
        }

        const player = client.poru.players.get(message.guild.id);
        const memberChannel = message.member.voice.channelId;
        const botChannel = message.guild.members.me.voice.channelId;

        if (command.inVc && !memberChannel) {
            return message.channel.send('You must be in a Voice Channel to use this Command!');
        }

        if (command.sameVc && player && botChannel !== memberChannel) {
            return message.channel.send('You must be in the same Voice Channel as me!');
        }

        if (command.player && !player) {
            return message.channel.send('No player exists for this server.');
        }

        if (command.current && (!player || !player.currentTrack)) {
            return message.channel.send('There is nothing playing right now.');
        }

        if (command.args && !args.length) {
            return message.channel.send(`You didn't provide any arguments.`);
        }

        try {
            let msg = await message.reply("⚙️ Tinkering under the hood... Please hold on.");
            client.prefix = data.prefix;
            await command.execute(client, message, args).then(() => {
                msg.delete().catch(err => { })
            });
        } catch (error) {
            console.error('Error executing command:', error);
            message.channel.send('There was an error executing that command.');
        }
    }
}