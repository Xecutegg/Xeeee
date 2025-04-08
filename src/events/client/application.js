import Application from '../../database/models/application.js';
import { sendMail } from "../../utils/send-mail.js";
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

const FLAGS = 64;

const sendWhatsAppMessage = async (no, msg, media = null) => {
    try {
        const response = await fetch('http://whatsapp.cycloneaddons.hackclub.app/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                number: "91" + no,
                message: msg,
                media,
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.message);
        return null; // Return null to indicate failure
    }
};

const wamsg = (name, email) => {
    return `Hey ${name},

Check your ${email} to see your staff application status. We have sent you an email with the result.

If your application is approved, please proceed with the next steps mentioned in the email.
If your application is rejected, feel free to contact the One Dream Esports Administration Team for further assistance.`;
};

const handleApproval = async (interaction, db, data) => {
    if (db.approved) {
        return interaction.reply({ content: "Already Approved", flags: FLAGS });
    }
    if (db.rejected) {
        return interaction.reply({ content: "You Can't Approve this application anymore because it is already rejected", flags: FLAGS });
    }

    await interaction.reply({ content: "Wait Sending Message...", flags: FLAGS });
    const msg = wamsg(db.name, db.email);

    const [whatsappResult, emailResult] = await Promise.allSettled([
        sendWhatsAppMessage(db.contactInfo, msg),
        sendMail(db.email, "Congrats! Your Application For Staff Has Been Approved!", data, "approveApp"),
    ]);

    if (whatsappResult.status === "rejected") {
        console.error("WhatsApp Error:", whatsappResult.reason.message);
    }
    if (emailResult.status === "rejected") {
        console.error("Email Error:", emailResult.reason.message);
    }

    db.approved = true;
    await db.save();
    interaction.followUp({ content: "Staff Approved Mail & WhatsApp Msg Sent", flags: FLAGS });
};

const handleRejection = async (interaction, dbId) => {
    const modal = new ModalBuilder()
        .setCustomId(`reason_${dbId}_ws`)
        .setTitle('Rejection Reason');

    const reasonInput = new TextInputBuilder()
        .setCustomId('reasontext')
        .setLabel('Reason')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Enter The Reason Of Rejection')
        .setRequired(true);

    const firstRow = new ActionRowBuilder().addComponents(reasonInput);
    modal.addComponents(firstRow);

    await interaction.showModal(modal);
};

const handleCustomWhatsApp = async (interaction, dbId) => {
    const modal = new ModalBuilder()
                    .setCustomId(`cwhatsapp_${dbId}_ws`)
                    .setTitle('Send Custom Whatsapp Message');
    
                const contentInput = new TextInputBuilder()
                    .setCustomId('whatsapp_content')
                    .setLabel('Whatsapp Content')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Enter the content of the Whatsapp Message.')
                    .setRequired(true);
    
                const secondRow = new ActionRowBuilder().addComponents(contentInput);
    
                modal.addComponents(secondRow);
                await interaction.showModal(modal);
}

const handleCustomEmail = async (interaction, dbId) => {
    const modal = new ModalBuilder()
                    .setCustomId(`cemail_${dbId}_ws`)
                    .setTitle('Send Custom Email');
    
                const subjectInput = new TextInputBuilder()
                    .setCustomId('email_subject')
                    .setLabel('Email Subject')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Enter email subject')
                    .setRequired(true);
    
                const contentInput = new TextInputBuilder()
                    .setCustomId('email_content')
                    .setLabel('Email Content')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Enter the content of the email')
                    .setRequired(true);
    
                const firstRow = new ActionRowBuilder().addComponents(subjectInput);
                const secondRow = new ActionRowBuilder().addComponents(contentInput);
    
                modal.addComponents(firstRow, secondRow);
                await interaction.showModal(modal);
}



const handleModalSubmit = async (interaction, db, data) => {
    await interaction.reply({ content: 'Wait Sending Message...', flags: FLAGS });
    const reason = interaction.fields.getTextInputValue('reasontext');
    const msg = wamsg(db.name, db.email);

    const [whatsappResult, emailResult] = await Promise.allSettled([
        sendWhatsAppMessage(db.contactInfo, msg),
        sendMail(db.email, "Your Application For Staff Has Been Rejected!", data, "rejectApp", null, reason),
    ]);

    if (whatsappResult.status === "rejected") {
        console.error("WhatsApp Error:", whatsappResult.reason.message);
    }
    if (emailResult.status === "rejected") {
        console.error("Email Error:", emailResult.reason.message);
    }

    db.rejected = true;
    await db.save();
    interaction.followUp({ content: "Staff Rejection Mail & WhatsApp Msg Sent", flags: FLAGS });
};

export default {
    name: "interactionCreate",
    async run(interaction) {
        const customIdParts = interaction.customId.split("_");
        const action = customIdParts[0];
        const dbId = customIdParts[1];
        const isWs = customIdParts[2] === "ws";

        if (!isWs) return;
        if (!interaction.member.roles.cache.has("1049278109737816064")) {
            return interaction.reply({ content: "Only Support Team Can Use These buttons...", flags: FLAGS });
        }

        const db = await Application.findById(dbId);
        if (!db) return interaction.deferUpdate();

        const data = { name: db.name, role: db.positionsApplied };

        if (action === "approve") {
            await handleApproval(interaction, db, data);
        } else if (action === "reject") {
            if (db.rejected) {
                return interaction.reply({ content: "Already Rejected", flags: FLAGS });
            }
            if (db.approved) {
                return interaction.reply({ content: "You Can't Reject this application anymore because it is already approved", flags: FLAGS });
            }
            await handleRejection(interaction, dbId);
        } else if (interaction.isModalSubmit() && action === "reason") {
            await handleModalSubmit(interaction, db, data);
        } else if (action === "whatsapp") {
            await handleCustomWhatsApp(interaction, dbId);
        } else if (interaction.isModalSubmit() && action === "cwhatsapp") {
            await interaction.reply({ content: "Wait Sending Message...", flags: FLAGS });
            const content = interaction.fields.getTextInputValue('whatsapp_content');
            await sendWhatsAppMessage(db.contactInfo, content);
            interaction.followUp({ content: "Custom WhatsApp Message Sent", flags: FLAGS });
        } else if (action === "email") {
            await handleCustomEmail(interaction, dbId);
        } else if (interaction.isModalSubmit() && action === "cemail") {
            await interaction.reply({ content: "Wait Sending Message...", flags: FLAGS });
            const subject = interaction.fields.getTextInputValue('email_subject');
            const content = interaction.fields.getTextInputValue('email_content');
            await sendMail(db.email, subject, {}, "custom", content).catch((err) => {
                console.error("Email Error:", err.message);
            });
            interaction.followUp({ content: "Custom Email Sent", flags: FLAGS });
        }
    },
};