import { ComponentType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } from 'discord.js';
import resolveUser from '../../utils/resolveUser.js'

export default {
    name: 'userinfo',
    aliases: ['ui'],
    description: 'Displays detailed information about a user.',
    usage: '[user mention | user ID | username]',
    category: 'utility',
    botperms: ['SendMessage'],
    async execute(client, message, args) {
        // Determine the user to fetch
        let user = args[0] ? await resolveUser(args.join(' ')) : message.author;
        if (!user) return message.reply("User not found.");

        const guildMember = await message.guild.members.fetch(user.id).catch(() => null);

        if (!guildMember) {
            let embed = new EmbedBuilder()
                .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                .addFields({
                    name: "General information",
                    value: `**Name**: ${user.tag}\n**ID**: ${user.id}\n**Mention**: <@${user.id}>\n**Bot?**: ${user.bot ? "Yes" : "No"}\n**Account Created**: ${user.createdAt.toLocaleString()}`,
                    inline: false
                })
                .setColor(Colors.Green)
                .setThumbnail(user.displayAvatarURL())
                .setFooter({ text: `${user.tag} is not in this server.`, iconURL: user.displayAvatarURL() })
            return message.reply({ embeds: [embed] });
        }

        const userInfoEmbed = new EmbedBuilder()
            .setTitle('User Info')
            .setColor(Colors.Green)
            .setDescription(`${user.tag}'s details`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'Username', value: user.username, inline: true },
                { name: 'Status', value: guildMember.presence ? guildMember.presence.status : 'Offline', inline: true },
                { name: 'Joined Server', value: guildMember.joinedAt.toLocaleString(), inline: true },
                { name: 'Account Created', value: user.createdAt.toLocaleString(), inline: true }
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        // Define roles pagination
        const rolesPerPage = 10;
        const roles = guildMember.roles.cache
            .sort((a, b) => a.position - b.position)
            .map(v => v).map((role, index) => `${++index}. ${role.name}`);
        const rolePages = [];

        for (let i = 0; i < roles.length; i += rolesPerPage) {
            rolePages.push(roles.slice(i, i + rolesPerPage));
        }

        // Create and send the initial message
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('userinfo').setLabel('User Info').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('roles_0').setLabel('Roles').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('permissions').setLabel('Key Permissions').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('acknowledgements').setLabel('Acknowledgements').setStyle(ButtonStyle.Primary)
            );

        if (user.banner) { // Check if the user has a banner
            actionRow.addComponents(
                new ButtonBuilder().setCustomId('banner').setLabel('Banner').setStyle(ButtonStyle.Primary)
            );
        }

        const initialMessage = await message.channel.send({
            embeds: [userInfoEmbed],
            components: [actionRow]
        });

        // Handle button interactions
        const filter = interaction => interaction.isButton();
        const collector = initialMessage.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: 'This is not for you!', ephemeral: true });
            }

            if (interaction.customId === 'userinfo') {
                await interaction.update({ embeds: [userInfoEmbed], components: [actionRow] });
            } else if (interaction.customId.startsWith('roles_')) {
                const pageIndex = parseInt(interaction.customId.split('_')[1], 10);
                const rolesEmbed = new EmbedBuilder()
                    .setTitle('Roles')
                    .setDescription(rolePages[pageIndex].join('\n') || 'No roles')
                    .setColor(Colors.Green);

                await interaction.update({
                    embeds: [rolesEmbed], components: [new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId(`roles_${pageIndex - 1}`).setLabel('Previous').setStyle(ButtonStyle.Secondary).setDisabled(pageIndex === 0),
                            new ButtonBuilder().setCustomId(`roles_${pageIndex + 1}`).setLabel('Next').setStyle(ButtonStyle.Secondary).setDisabled(pageIndex >= rolePages.length - 1),
                            new ButtonBuilder().setCustomId('back_to_main').setLabel('Go Back to Main Menu').setStyle(ButtonStyle.Secondary)
                        )
                    ]
                });
            } else if (interaction.customId === 'permissions') {
                const keyPermissionsEmbed = new EmbedBuilder()
                    .setTitle('Key Permissions')
                    .setDescription('List of key permissions.')
                    .addFields({ name: 'KeyPermissions', value: guildMember.permissions.toArray().map(p => `\`${p}\``).join(', ') || 'None' })
                    .setColor(Colors.Green);

                await interaction.update({ embeds: [keyPermissionsEmbed] });
            } else if (interaction.customId === 'acknowledgements') {
                const acknowledgements = user.id === message.guild.ownerId ? 'Server Owner' :
                    guildMember.roles.cache.some(role => role.name.toLowerCase().includes('admin')) ? 'Admin' :
                        guildMember.roles.cache.some(role => role.name.toLowerCase().includes('mod') || role.name.toLowerCase().includes('staff')) ? 'Staff/Mod' :
                            'Regular Member';

                const acknowledgementsEmbed = new EmbedBuilder()
                    .setTitle('Acknowledgements')
                    .addFields({ name: "Acknowledgements for the user.", value: acknowledgements })
                    .setColor(Colors.Green);

                await interaction.update({ embeds: [acknowledgementsEmbed] });
            } else if (interaction.customId === 'banner') {
                const userBannerEmbed = new EmbedBuilder()
                    .setTitle('User Banner')
                    .setDescription('User banner information.')
                    .setImage(user.bannerURL())
                    .setColor(Colors.Green);

                await interaction.update({ embeds: [userBannerEmbed] });
            } else if (interaction.customId === 'back_to_main') {
                await interaction.update({ embeds: [userInfoEmbed], components: [actionRow] });
            }
        });

        collector.on('end', async () => {
            await initialMessage.edit({ components: [] });
        });
    }
};
