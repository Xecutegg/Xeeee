import Idp from '../../database/models/idp.js';
import { EmbedBuilder, Colors } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

export default {
    name: "interactionCreate",
    async run(interaction) {
        if (!interaction.customId.startsWith("sendidp")) return;
        if (!message.member.permissions.has('ModerateMembers')) {
            return interaction.reply({ content: "Only Managment Can Use This You Can't...", flags: 64 });
        }
//1049278095313608704

        const db = await Idp.findOne({ channelID: interaction.channel.id, guildID: interaction.guild.id });

    if(interaction.customId === 'sendidp') {
        const model = new ModalBuilder()
            .setCustomId('sendidp_model')
            .setTitle('IDP INFO')

            const id = new TextInputBuilder()
                .setCustomId('id')
                .setLabel('Enter the room ID')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter The ID Of Room')
                .setRequired(true);

            const pass = new TextInputBuilder()
                .setCustomId('pass')
                .setLabel('Enter the Room Password')
                .setValue('BGMI')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter The Password Of Room')
                .setRequired(true);

                const firstRow = new ActionRowBuilder().addComponents(id);
                const secondRow = new ActionRowBuilder().addComponents(pass);

                model.addComponents(firstRow, secondRow);
                await interaction.showModal(model);
    }

    if(interaction.customId === 'sendidp_model'){
        interaction.deferUpdate();

        const id = interaction.fields.getTextInputValue('id');
        const pass = interaction.fields.getTextInputValue('pass');
    
        const idp = `
        \`\`\`yaml\nID: ${id}\nPASSWORD: ${pass}\nMAP: ${db.map}\nSTART TIME: ${db.startTime}\`\`\`
        `
        const embed = new EmbedBuilder()
            .setDescription(idp+db.message)
            .setColor(Colors.Blue)

       interaction.channel.send({ content: `${db.title} ${db.roleID}`,embeds: [embed] })
    }



    }
}