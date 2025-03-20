import { EmbedBuilder, Colors } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import Idp from '../database/models/idp.js';

export default {
    name: 'idp-setup',
    userPermissions: ['ManageMessages'],
    botPermissions: ['ManageMessages'],
    async execute(client, message, args) {

        const embed = new EmbedBuilder()
            .setTitle('IDP Setup')
            .setColor(Colors.Blue)
            .setDescription(`Hey, ${message.author.displayName}! Let's start setting up your IDP!\nPlease Click on button below and provide data for IDP setup.`);



        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('embedmsg')
                    .setLabel('Embed Message')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('template')
                    .setLabel('Template of IDP')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId('sendembed')
                  .setLabel('Send Embed')
                  .setStyle(ButtonStyle.Success),
                        

            );

        const msg = await message.channel.send({ embeds: [embed], components: [buttons] });

        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600_000 });


        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: 'This is not for you!', flags: 64 });
            }
            const db  = await Idp.findOne({ channelID: message.channel.id, guildID: message.guild.id });

            console.log(db);
            if (i.customId === 'embedmsg') { 
                handleEmbedMsg(client, message, i, db);
             }
            if (i.customId === 'template') { 
                if (!db) return i.reply({ content: 'First You Need To Provide Embed Message...', flags: 64 });
                handleTemplate(client, message, i); 
            }

            if (i.customId === 'sendembed') {
                if (!db) return i.reply({ content: 'First You Need To Provide Embed Message...', flags: 64 });
                if (!db.message) return i.reply({ content: 'First You Need To Provide Embed Message...', flags: 64 });

                const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('sendidp')
                        .setLabel('Send IDP')
                        .setStyle(ButtonStyle.Success)
                );

                const embed = new EmbedBuilder()
                    .setDescription(db.embedMsg)
                    .setColor(Colors.Blue)
                    .setFooter({ text: "MAP: " + db.map })
                    await i.channel.send({ embeds: [embed], components: [buttons] });
                    i.message.delete();
            }


        });


    },
};

async function handleTemplate(client, message, i) {
    const model = new ModalBuilder()
    .setCustomId('modeltemplate')
    .setTitle('Template of IDP in 10 Min...');

const titleInput = new TextInputBuilder()
    .setCustomId('title')
    .setLabel('Title')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter The Title Of IDP')
    .setRequired(true);

const mapInput = new TextInputBuilder()
    .setCustomId('map')
    .setLabel('Map')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter The Map Of IDP')
    .setRequired(true);

const startTimeInput = new TextInputBuilder()
    .setCustomId('startTime')
    .setLabel('Start Time')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter The Start Time Of IDP')
    .setRequired(true);

const messageInput = new TextInputBuilder()
    .setCustomId('message')
    .setLabel('Message')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Enter The Message Of IDP')
    .setRequired(true);

const roleInput = new TextInputBuilder()
    .setCustomId('idprole')
    .setLabel('IDP ROLE')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter The ROLE ID Of IDP')
    .setRequired(true);
// Put each TextInput in its own ActionRow:
const firstRow = new ActionRowBuilder().addComponents(titleInput);
const secondRow = new ActionRowBuilder().addComponents(mapInput);
const thirdRow = new ActionRowBuilder().addComponents(startTimeInput);
const fourthRow = new ActionRowBuilder().addComponents(messageInput);
const fifthRow = new ActionRowBuilder().addComponents(roleInput);

model.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

    await i.showModal(model);
    const modelInteraction = await i.awaitModalSubmit({ time: 600_000 });
    if (!modelInteraction) return i.followUp({ content: 'You did not provide the data in time!', flags: 64 });
    await modelInteraction.deferUpdate();
    const title = modelInteraction.fields.getTextInputValue('title');
    const map = modelInteraction.fields.getTextInputValue('map');
    const startTime = modelInteraction.fields.getTextInputValue('startTime');
    const msg = modelInteraction.fields.getTextInputValue('message');
    const roleID = modelInteraction.fields.getTextInputValue('idprole');
    
    await Idp.findOneAndUpdate({
        channelID: message.channel.id,
        guildID: message.guild.id,
    }, {
        title,
        map,
        startTime,
        message: msg,
        roleID,
    });
    await modelInteraction.followUp({ content: 'Template Added Successfully!', flags: 64 });

}



async function handleEmbedMsg(client, message, i, db) {
    const modal = new ModalBuilder()
        .setCustomId(`modelembedmsg`)
        .setTitle('Embed Message in 60 Sec...');

    const msgInput = new TextInputBuilder()
        .setCustomId('msgg')
        .setLabel('Message ')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Enter The Message Of Embed')
        .setRequired(true);

    const firstRow = new ActionRowBuilder().addComponents(msgInput);
    modal.addComponents(firstRow);

     await i.showModal(modal);
     const modelInteraction = await i.awaitModalSubmit({ time: 60_000 });
        if (!modelInteraction) return i.followUp({ content: 'You did not provide the data in time!', flags: 64 });
        await modelInteraction.deferUpdate();
        const msg = modelInteraction.fields.getTextInputValue('msgg');
        if (db) {
            await Idp.findOneAndUpdate({
                    channelID: message.channel.id,
                    guildID: message.guild.id,
                }, {
                    embedMsg: msg,
                });
            } else {
                await Idp.create({
                    channelID: message.channel.id,
                    guildID: message.guild.id,
                    embedMsg: msg,
                });
            }
        
        await modelInteraction.followUp({ content: 'Embed Message Added Successfully!', flags: 64 });

}
