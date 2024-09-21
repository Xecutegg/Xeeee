import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    EmbedBuilder,
    StringSelectMenuBuilder,
    Colors,
} from "discord.js";
import WelcomeSettings from "../../database/models/welcome.js";
import { buildEmbed } from "../../utils/buildEmbed.js";
import { replacePlaceholders, replacePlaceholdersInEmbed } from "../eventsCmds/welcomeHandler.js";

export default {
    name: "welcome-setup",
    description: "Sets up the welcome channel, message, and embed options.",
    usage: `[WelcomeID || Channel]`,
    category: "welcomer",
    aliases: ["ws", "welcome-set", "welcome"],
    botperms: ["ManageChannels"],
    userperms: ["ManageChannels"],
    async execute(client, message, args) {
        try {
            const placeholders = {
                "{member.name}": "The name of the member who joined.",
                "{member.tag}": "The tag of the member who joined.",
                "{member.id}": "The ID of the member who joined.",
                "{member.mention}": "The mention of the member who joined",
                "{member.avatar}": "Avatar of the member who joined.",
                "{member.createdAt}": "The date the member's Discord account was created.",
                "{member.joinedAt}": "The date the member joined the server.",
                "{server.name}": "The name of the server.",
                "{server.id}": "The ID of the server.",
                "{server.icon}": "The icon of the server.",
                "{server.members}": "The total number of members in the server.",
                "{server.owner}": "Mention the owner of the server.",
                "{server.boosts}": "The number of boosts the server has.",
                "{server.boostTier}": "The current boost tier of the server.",

            };
            let arg = args.join(' ')?.replace(/^<#|>$/g, '') || null;
            let channel = message.guild.channels.cache.get(arg) || null;
            if (!channel) channel = message.guild.channels.cache.find(c => c.name.toLowerCase() === arg?.toLowerCase());
            const result = await WelcomeSettings.findOne({ channelId: channel?.id });

            let wchannel = result?.channelId ?? null; // Use provided channel or default to input
            let wremoveDuration = result?.deleteDuration ?? "null";
            let welcomeMessage = result?.welcomeMessage ?? "Welcome {member.name} to {server.name}!";
            let type = result?.type || "message";
            // Embed options
            let embed = {
                author: result?.embedOptions?.author || { name: null, iconURL: null },
                title: result?.embedOptions?.title || null,
                description: result?.embedOptions?.description !== " " && result?.embedOptions?.description !== undefined ? result?.embedOptions?.description : "Welcome {member.name} to {server.name}!",
                color: result?.embedOptions?.color || null,
                footer: result?.embedOptions?.footer || { text: null, iconURL: null },
                image: result?.embedOptions?.image || null,
                thumbnail: result?.embedOptions?.thumbnail || null,
            };
            const updateField = (field, value) => {
                switch (field) {
                    case "author.name":
                        embed.author.name = value;
                        return embed.author.name;
                    case "author.iconURL":
                        embed.author.iconURL = value;
                        return embed.author.iconURL;
                    case "title":
                        embed.title = value;
                        return embed.title;
                    case "description":
                        embed.description = value;
                        return embed.description;
                    case "color":
                        embed.color = value;
                        return embed.color;
                    case "footer.text":
                        embed.footer.text = value;
                        return embed.footer.text;
                    case "footer.iconURL":
                        embed.footer.iconURL = value;
                        return embed.footer.iconURL;
                    case "image":
                        embed.image = value;
                        return embed.image;
                    case "thumbnail":
                        embed.thumbnail = value;
                        return embed.thumbnail;
                    default:
                        throw new Error("Unknown field");
                }
            };
            let mainembed = new EmbedBuilder()
                .setColor(Colors.Green)
                .addFields(
                    { name: "Channel", value: wchannel ? `<#${wchannel}>` : "None", inline: true },
                    { name: "Delete Duration", value: wremoveDuration ? wremoveDuration : "None", inline: true },
                    { name: "Type", value: type, inline: true },
                    {
                        name: "Placeholders", value: Object.entries(placeholders).map(([key, value]) => `- **${key}** - \`${value}\``).join("\n") || "None", inline: false
                    }
                )
            const initialMessage = await message.reply({
                content: "Welcome to the advanced welcome system. Please configure the options below.",
                embeds: [mainembed],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ChannelSelectMenuBuilder()
                                .setCustomId('welcome-channel')
                                .setPlaceholder("Select a channel")
                                .addChannelTypes(ChannelType.GuildText)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('delete-duration')
                                .setPlaceholder("Choose a welcome message delete duration")
                                .addOptions([
                                    { label: 'No delete', value: 'null' },
                                    { label: '1 minute', value: '1m' },
                                    { label: '5 minutes', value: '5m' },
                                    { label: '10 minutes', value: '10m' },
                                    { label: '15 minutes', value: '15m' },
                                    { label: '30 minutes', value: '30m' },
                                    { label: '1 hour', value: '1h' },
                                ])
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('edit-message')
                                .setLabel('Edit Welcome Message')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId('edit-embed')
                                .setLabel('Edit Welcome Embed')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId('type')
                                .setLabel('Type')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId('preview')
                                .setLabel('Preview')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId('save-settings')
                                .setLabel('Save')
                                .setStyle(ButtonStyle.Success)
                        )
                ]
            });
            const collector = initialMessage.createMessageComponentCollector({ time: 150_000 }); // 5 minutes
            collector.on('collect', async (interaction) => {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({ content: 'This is not for you!', ephemeral: true });
                }
                try {
                    await interaction.deferUpdate();
                    switch (interaction.customId) {
                        case 'welcome-channel':
                            collector.resetTimer();
                            wchannel = interaction.values[0];
                            await initialMessage.edit({
                                embeds: [{
                                    color: embed.color,
                                    fields: [
                                        { name: "Channel", value: wchannel ? "<#" + wchannel + ">" : "None", inline: true },
                                        { name: "Delete Duration", value: wremoveDuration ? wremoveDuration : "None", inline: true },
                                        { name: "Type", value: type, inline: true },
                                        {
                                            name: "Placeholders", value: Object.entries(placeholders).map(([key, value]) => `- **${key}** - \`${value}\``).join("\n") || "None", inline: false
                                        }
                                    ]
                                }]
                            });
                            break;
                        case 'delete-duration':
                            collector.resetTimer();
                            wremoveDuration = interaction.values[0];
                            await initialMessage.edit({
                                embeds: [{
                                    color: embed.color,
                                    fields: [
                                        { name: "Channel", value: wchannel ? "<#" + wchannel + ">" : "None", inline: true },
                                        { name: "Delete Duration", value: wremoveDuration ? wremoveDuration : "None", inline: true },
                                        { name: "Type", value: type, inline: true },
                                        {
                                            name: "Placeholders", value: Object.entries(placeholders).map(([key, value]) => `- **${key}** - \`${value}\``).join("\n") || "None", inline: false
                                        }
                                    ]
                                }]
                            });
                            break;
                        case "type":
                            collector.resetTimer();
                            let btn = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('message')
                                        .setLabel('Message')
                                        .setStyle(ButtonStyle.Secondary),
                                    new ButtonBuilder()
                                        .setCustomId('embed')
                                        .setLabel('Embed')
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId('both')
                                        .setLabel('Both')
                                        .setStyle(ButtonStyle.Success)
                                );
                            let f = await interaction.followUp({ content: 'Choose a welcome type!', components: [btn], ephemeral: true });
                            let c = f.createMessageComponentCollector({ time: 120_000 }); // 5 minutes
                            c.on('collect', async (i) => {
                                type = i.customId;
                                await initialMessage.edit({
                                    embeds: [{
                                        color: embed.color,
                                        fields: [
                                            { name: "Channel", value: wchannel ? "<#" + wchannel + ">" : "None", inline: true },
                                            { name: "Delete Duration", value: wremoveDuration ? wremoveDuration : "None", inline: true },
                                            { name: "Type", value: type, inline: true },
                                            {
                                                name: "Placeholders", value: Object.entries(placeholders).map(([key, value]) => `- **${key}** - \`${value}\``).join("\n") || "None", inline: false
                                            }
                                        ]
                                    }]
                                });
                                await i.update({ content: `Welcome type updated to ${type}.`, components: [], ephemeral: true });
                            });
                            break;

                        case 'edit-message':
                            collector.resetTimer();
                            await interaction.followUp({ content: "Please type the welcome message. Use placeholders like `{member.username}`, `{server.name}`, `{server.members}`.", ephemeral: true });
                            const messageFilter = response => response.author.id === message.author.id;
                            const messageCollector = message.channel.createMessageCollector({ filter: messageFilter, max: 1, time: 30_000 });
                            messageCollector.on('collect', m => {
                                welcomeMessage = m.content;
                                m.delete();
                                interaction.followUp({ content: "Welcome message updated.", ephemeral: true });
                            });

                            messageCollector.on('end', collected => {
                                if (collected.size === 0) {
                                    interaction.followUp({ content: "No message received. Welcome message not updated.", ephemeral: true });
                                }
                            });
                            break;
                        case 'edit-embed':
                            collector.resetTimer();
                            let components = new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('edit-embed-field')
                                        .setPlaceholder("Select the field you want to edit")
                                        .addOptions(
                                            { label: 'Author Name', value: 'author.name' },
                                            { label: 'Author Icon URL', value: 'author.iconURL' },
                                            { label: 'Title', value: 'title' },
                                            { label: 'Description', value: 'description' },
                                            { label: 'Color', value: 'color' },
                                            { label: 'Footer Text', value: 'footer.text' },
                                            { label: 'Footer Icon URL', value: 'footer.iconURL' },
                                            { label: 'Timestamp', value: 'timestamp' },
                                            { label: 'Image URL', value: 'image' },
                                            { label: 'Thumbnail URL', value: 'thumbnail' },
                                        )
                                );
                            let btn2 = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('back')
                                        .setLabel('Back')
                                        .setStyle(ButtonStyle.Secondary),
                                );
                            await initialMessage.edit({ embeds: [await buildEmbed(await replacePlaceholdersInEmbed({ ...embed }, message.member, message.guild))], components: [components, btn2] });
                            const filter = i => i.user.id === interaction.user.id;
                            let fieldCollector = interaction.channel.createMessageComponentCollector({ filter, time: 120_000 });

                            fieldCollector.on('collect', async i => {
                                if (i.customId === 'edit-embed-field') {
                                    fieldCollector.resetTimer();
                                    let selectedField = i.values[0];
                                    await interaction.followUp({ content: `* Type The Message You Want To Set *Otherwise*\n* Type \`Cancel\` To Cancel Cmd.\n* Type \`Remove\` To Remove Current Msg.`, ephemeral: true });
                                    const newValueFilter = response => response.author.id === interaction.user.id;
                                    const newValueCollector = i.channel.createMessageCollector({ filter: newValueFilter, max: 1, time: 30_000 });
                                    newValueCollector.on('collect', async (m) => {
                                        if (m.content.toLowerCase() === "cancel") {
                                            newValueCollector.stop();
                                            await i.followUp({ content: "Update cancelled.", ephemeral: true });
                                            m.delete();
                                            return;
                                        }
                                        if (m.content.toLowerCase() === "remove") {
                                            await updateField(selectedField, null);
                                            await initialMessage.edit({
                                                content: replacePlaceholders(welcomeMessage, message.member, message.guild),
                                                embeds: [await buildEmbed(await replacePlaceholdersInEmbed({ ...embed }, message.member, message.guild))],
                                                components: [components, btn2]
                                            });
                                            await i.followUp({ content: `Field was removed.`, ephemeral: true });
                                            m.delete();
                                            return;
                                        }
                                        updateField(selectedField, m.content);
                                        await initialMessage.edit({
                                            content: replacePlaceholders(welcomeMessage, message.member, message.guild),
                                            embeds: [await buildEmbed(await replacePlaceholdersInEmbed({ ...embed }, message.member, message.guild))],
                                            components: [components, btn2]
                                        });
                                        await m.delete();
                                    });

                                    newValueCollector.on('end', collected => {
                                        if (collected.size === 0) {
                                            i.followUp({ content: "No message received. Update not completed.", ephemeral: true });
                                        }
                                    });
                                }
                            });
                            break;
                        case 'back':
                            await initialMessage.edit({
                                embeds: [{
                                    color: embed.color,
                                    fields: [
                                        { name: "Channel", value: wchannel ? "<#" + wchannel + ">" : "None", inline: true },
                                        { name: "Delete Duration", value: wremoveDuration ? wremoveDuration : "None", inline: true },
                                        { name: "Type", value: type, inline: true },
                                        {
                                            name: "Placeholders", value: Object.entries(placeholders).map(([key, value]) => `- ** ${key} ** - \`${value}\``).join("\n") || "None", inline: false
                                        }
                                    ]
                                }],
                                components: [
                                    new ActionRowBuilder()
                                        .addComponents(
                                            new ChannelSelectMenuBuilder()
                                                .setCustomId('welcome-channel')
                                                .setPlaceholder("Select a channel")
                                                .addChannelTypes(ChannelType.GuildText)
                                        ),
                                    new ActionRowBuilder()
                                        .addComponents(
                                            new StringSelectMenuBuilder()
                                                .setCustomId('delete-duration')
                                                .setPlaceholder("Choose a welcome message delete duration")
                                                .addOptions([
                                                    { label: 'No delete', value: 'null' },
                                                    { label: '1 minute', value: '1m' },
                                                    { label: '5 minutes', value: '5m' },
                                                    { label: '10 minutes', value: '10m' },
                                                    { label: '15 minutes', value: '15m' },
                                                    { label: '30 minutes', value: '30m' },
                                                    { label: '1 hour', value: '1h' },
                                                ])
                                        ),
                                    new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                                .setCustomId('edit-message')
                                                .setLabel('Edit Welcome Message')
                                                .setStyle(ButtonStyle.Primary),
                                            new ButtonBuilder()
                                                .setCustomId('edit-embed')
                                                .setLabel('Edit Welcome Embed')
                                                .setStyle(ButtonStyle.Secondary),
                                            new ButtonBuilder()
                                                .setCustomId('type')
                                                .setLabel('Type')
                                                .setStyle(ButtonStyle.Secondary),
                                            new ButtonBuilder()
                                                .setCustomId('preview')
                                                .setLabel('Preview')
                                                .setStyle(ButtonStyle.Secondary),
                                            new ButtonBuilder()
                                                .setCustomId('save-settings')
                                                .setLabel('Save')
                                                .setStyle(ButtonStyle.Success)
                                        )]
                            });
                            break;
                        case 'preview':
                            collector.resetTimer();
                            if (!wchannel || !welcomeMessage) return interaction.followUp({ content: "Please set the welcome message and channel first.", ephemeral: true });
                            let tosend = {};
                            if (type === "message") {
                                tosend = { content: replacePlaceholders(welcomeMessage, interaction.member, interaction.guild) };
                            } else if (type === "embed") {
                                tosend = { embeds: [await buildEmbed(await replacePlaceholdersInEmbed({ ...embed }, interaction.member, interaction.guild))] };
                            } else {
                                tosend = { content: replacePlaceholders(welcomeMessage, interaction.member, interaction.guild), embeds: [await buildEmbed(await replacePlaceholdersInEmbed({ ...embed }, interaction.member, interaction.guild))] };
                            }
                            let channel = await message.guild.channels.cache.get(wchannel);
                            let pre = await channel.send(tosend);
                            await interaction.followUp({ content: `Preview hase sent to ${channel.name}`, ephemeral: true });
                            if (wremoveDuration !== "null") {
                                setTimeout(async () => {
                                    await pre.delete();
                                }, parseInt(wremoveDuration) * 60 * 1000);
                            }
                            break;
                        case 'save-settings':
                            if (!wchannel) return interaction.followUp({ content: "Please set the welcome channel first.", ephemeral: true });
                            try {
                                // Drop the index if it's causing issues (you may want to remove this in production)
                                WelcomeSettings.collection.dropIndex("guildId_1", () => { });

                                // Create the update object with all fields you want to update
                                const updateData = {
                                    guildId: message.guild.id,
                                    channelId: wchannel,
                                    type: type,
                                    deleteDuration: wremoveDuration,
                                    welcomeMessage: welcomeMessage,
                                    embedOptions: { ...embed }
                                };

                                await WelcomeSettings.findOneAndUpdate(
                                    { guildId: message.guild.id, channelId: wchannel },
                                    { $set: updateData },
                                    { upsert: true, new: true }
                                )
                                    .then(async () => {
                                        await initialMessage.edit({ content: "Welcome settings have been saved successfully!", embeds: [], components: [] });
                                    })
                                    .catch(async (error) => {
                                        console.error(error);
                                        await initialMessage.edit({ content: "An error occurred while saving the welcome settings.", embeds: [], components: [] });
                                    });

                            } catch (error) {
                                console.log(error);

                                if (error.code === 11000) {
                                    await interaction.followUp({ content: "These welcome settings already exist.", ephemeral: true });
                                } else {
                                    await interaction.followUp({ content: "An error occurred while saving the welcome settings.", ephemeral: true });
                                }
                            }
                            collector.stop();
                            break;
                    }
                } catch (error) {
                    console.error(error);
                    await interaction.followUp({ content: "An error occurred while processing your request.", ephemeral: true });
                }
            });

            collector.on('end', collected => {
                initialMessage.edit({ embeds: [], components: [] });
            });
        } catch (error) {
            console.error(error);
            message.reply("An error occurred while trying to set up the welcome channel.");
        }
    },
};