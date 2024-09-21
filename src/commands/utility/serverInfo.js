import { ComponentType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } from "discord.js";

export default {
    name: "serverinfo",
    aliases: ['si'],
    description: "Displays information about the server.",
    usage: "[server name]",
    category: "utility",
    botperms: ["SendMessage"],
    async execute(client, message, args) {
        const guild = await client.guilds.fetch(message.guild.id);
        if (!guild) return message.reply("I couldn't find that server.");

        // Fetch owner information
        const owner = await guild.fetchOwner();

        // Main server info
        let about = new EmbedBuilder()
            .setAuthor({ name: `${guild.name} Information`, iconURL: guild.iconURL() })
            .setTitle('About')
            .setColor(Colors.Green)
            .addFields(
                { name: "Name", value: guild.name, inline: false },
                { name: "ID", value: guild.id, inline: false },
                { name: "Member Count", value: `${guild.memberCount}`, inline: false },
                { name: "Creation Date", value: guild.createdAt.toLocaleString(), inline: false },
                { name: "Owner", value: `${owner.user.tag} (${guild.ownerId})`, inline: false },
                { name: "Description", value: guild.description ? guild.description : "No description", inline: false }
            )
            .setThumbnail(guild.iconURL())
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        // Extra information about the server
        let extra = new EmbedBuilder()
            .setAuthor({ name: `${guild.name} Extra Information`, iconURL: guild.iconURL() })
            .setTitle('Extra Information')
            .setColor(Colors.Green)
            .addFields(
                { name: "Verification Level", value: `${guild.verificationLevel}`, inline: false },
                { name: "Upload Limit", value: guild.premiumTier >= 1 ? "50MB" : "8MB", inline: false },
                { name: "Inactive Channel", value: guild.afkChannel ? `<#${guild.afkChannelId}>` : "None", inline: false },
                { name: "Inactive Timeout", value: `${guild.afkTimeout / 60} mins`, inline: false },
                { name: "System Messages Channel", value: guild.systemChannel ? `<#${guild.systemChannelId}>` : "None", inline: false },
                { name: "System Welcome Messages", value: !guild.systemChannelFlags.has('SuppressGuildReminderNotifications') ? "✅" : "❎", inline: false },
                { name: "System Boost Messages", value: !guild.systemChannelFlags.has('SuppressPremiumSubscriptions') ? "✅" : "❎", inline: false },
                { name: "Default Notifications", value: guild.defaultMessageNotifications === 1 ? "Only @mentions" : "All Members", inline: false },
                { name: "Explicit Media Content Filter", value: guild.explicitContentFilter === 2 ? "All Members" : guild.explicitContentFilter === 1 ? "Members without roles" : "Disabled", inline: false },
                { name: "2FA Requirement", value: guild.mfaLevel === 1 ? "✅" : "❎", inline: false },
                { name: "Boost Bar Enabled", value: guild.premiumProgressBarEnabled ? "✅" : "❎", inline: false },
            )
            .setThumbnail(guild.iconURL())
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        // Server features
        let features = [
            "GUILD_ONBOARDING_HAS_PROMPTS",
            "NEWS",
            "SOUNDBOARD",
            "GUILD_ONBOARDING",
            "WELCOME_SCREEN_ENABLED",
            "PREVIEW_ENABLED",
            "AUTO_MODERATION",
            "GUILD_ONBOARDING_EVER_ENABLED",
            "MEMBER_VERIFICATION_GATE_ENABLED",
            "CHANNEL_ICON_EMOJIS_GENERATED",
            "COMMUNITY"
        ].map(feature => ({
            name: feature.replace(/_/g, " ").toLocaleLowerCase(),
            value: guild.features.includes(feature) ? "✅" : "❎",
            inline: false
        }));

        let featuresEmbed = new EmbedBuilder()
            .setAuthor({ name: `${guild.name} Features`, iconURL: guild.iconURL() })
            .setTitle('Server Features')
            .setColor(Colors.Green)
            .addFields(features)
            .setThumbnail(guild.iconURL())
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        // Server roles with pagination
        const MAX_ROLES_PER_PAGE = 20;
        let roles = guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .map(role => ({
                name: `\`${role.name}\``,
                value: `Mentionable: ${role.mentionable ? "✅" : "❎"}\nPosition: ${role.position}`,
                inline: false
            }));

        let rolesPages = [];
        for (let i = 0; i < roles.length; i += MAX_ROLES_PER_PAGE) {
            rolesPages.push(roles.slice(i, i + MAX_ROLES_PER_PAGE));
        }

        let rolesEmbed = (pageIndex) => new EmbedBuilder()
            .setAuthor({ name: `${guild.name} Roles - Page ${pageIndex + 1}`, iconURL: guild.iconURL() })
            .setTitle('Server Roles')
            .setColor(Colors.Green)
            .addFields(rolesPages[pageIndex])
            .setThumbnail(guild.iconURL())
            .setFooter({ text: `Page ${pageIndex + 1} of ${rolesPages.length}` });

        // Buttons for each embed
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('about')
                    .setLabel('About')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('extra')
                    .setLabel('Extra')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('features')
                    .setLabel('Features')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('roles_0')
                    .setLabel('Roles')
                    .setStyle(ButtonStyle.Primary)
            );

        // Send the initial message with the About embed and buttons
        const initialMessage = await message.channel.send({ embeds: [about], components: [row] });

        // Create a collector to handle button interactions
        const filter = (interaction) => interaction.isButton();
        const collector = initialMessage.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) return await interaction.reply({ content: 'This is not for you!', ephemeral: true });
            
            const [command, pageIndex] = interaction.customId.split('_');
            if (command === 'about') {
                await interaction.update({ embeds: [about], components: [row] });
            } else if (command === 'extra') {
                await interaction.update({ embeds: [extra] });
            } else if (command === 'features') {
                await interaction.update({ embeds: [featuresEmbed] });
            } else if (command === 'roles') {
                const page = parseInt(pageIndex, 10) || 0;

                const rolesRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                         .setCustomId(`about`)
                         .setLabel('Go back')
                         .setStyle(ButtonStyle.Primary)
                         .setDisabled(false),
                        new ButtonBuilder()
                            .setCustomId(`roles_${page - 1}`)
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId(`roles_${page + 1}`)
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === rolesPages.length - 1),
                    );

                await interaction.update({ embeds: [rolesEmbed(page)], components: [rolesRow] });
            }
        });

        collector.on('end', async () => {
            // Disable buttons after time runs out
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('about')
                        .setLabel('About')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('extra')
                        .setLabel('Extra')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('features')
                        .setLabel('Features')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('roles_0')
                        .setLabel('Roles')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                );

            await initialMessage.edit({ components: [disabledRow] });
        });
    }
}
