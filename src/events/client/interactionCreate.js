import { radeon as client } from "../../index.js";
import Registration from '../../database/models/registration.js';
import { sendMail } from "../../utils/send-mail.js";
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
const sendWhatsAppMessage = async (no, msg, media=null) => {
    try {
        const response = await fetch('http://whatsapp.cycloneaddons.hackclub.app/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                number: "91"+no,
                message: msg,
                media,

            }),
        });

        const data = await response.json();
       return data
    } catch (error) {
        console.error('Error sending message:', error.message);
    }
};

const approveMsg = (igl, teamname, email, players)=> {
  return `*🎉 BGMI Summer Series Tournament Registration Approved!* 

Hello *${igl}*,  

✅ Your team's registration has been approved by *One Dream Esports*!  

Wishing you and your team the best of luck in the upcoming matches!  

━━━━━━━━━━━━━━━  
*🏆 Team Name:* ${teamname}  

👥 *Team Players:*  
${players.map((player, i) => `${++i}. ${player.name}`).join('\n')}  

📧 *Team Email:* ${email}  

━━━━━━━━━━━━━━━  
📢 *Important Notice:*
Your *Room ID, Password, Slot List, and Group Info* will be sent to your registered email.  
Please make sure your email is active and correct.  

If you need to update your email or phone number, please contact One Dream Esports management within *24 hours* of receiving this approval message.  



━━━━━━━━━━━━━━━  
Best wishes,  
*One Dream Esports Team*  
_Official Tournament Partner of Krafton_  `
}


const rejectMsg = (igl, teamname, reason) => {
    return `*⚠️ BGMI Summer Series Tournament Registration Rejected*  
  
  Hello *${igl}*,  
  
  We regret to inform you that your team registration for the *BGMI Summer Series Tournament* has been *rejected* by *One Dream Esports*.  
  
  ━━━━━━━━━━━━━━━  
  *🏆 Team Name:* ${teamname}  
  
  📢 *Reason for Rejection:*  
  ${reason}  
  
  ━━━━━━━━━━━━━━━  
  If you believe this was a mistake or wish to correct the issue, please contact us within *24 hours*.  
  
  🔗 *Support & Contact:*  
  📩 Email: support@onedreamesports.games  
  
  ━━━━━━━━━━━━━━━  
  Best regards,  
  *One Dream Esports Team*  
  _Official Tournament Partner of Krafton_`;
  }

  
export default {
    name: "interactionCreate",
    async run(interaction) {
       if(!interaction.member.roles.cache.has("1049278089684860980")) return interaction.reply({content: "Only Event Manager Can Use These button...", flags: 64 })

       const dbId = interaction.customId.split("_")[1];

       const db = await Registration.findById(dbId);
       const players = db.players.map((player, index) => {
            return {
                name: player.inGameName,
            }
        })
        const imgLink = (link) => {
            const match = link.match(/(?:drive\.google\.com\/.*id=|\/d\/|file\/d\/)([a-zA-Z0-9_-]+)/);
            return match ? `https://drive.usercontent.google.com/download?id=${match[1]}&export=view&authuser=0` : null;
          };
        
       const data = { igl: db.teamIgl || "Cyclone", email: db.emailAddress, teamname: db.teamName, teamlogo: imgLink(db.teamLogo), players };

       
       if(interaction.customId.split("_")[0] === "approve") {
        if(db.isApproved) return interaction.reply({content: "Already Approved", flags: 64});
        await interaction.reply({ content: "Wait Sending Message...", flags: 64 })
        const msg = approveMsg(db.teamIgl, db.teamName, db.emailAddress, players);
        await sendWhatsAppMessage(db.teamLeaderContactWhatsapp, msg).then(() => {
            console.log("WhatsApp Message Sent")
        }).catch((err) => {
            console.log(err)
        });

       await sendMail(db.emailAddress, "Congats Your Registration Approved !",  data, "approve").then(() => {
            console.log("Email Sent")
        }).catch((err) => {
            console.log(err)
        });
      

        db.isApproved = true;
        await db.save();
        interaction.followUp({content: "Registration Approved Mail & Whatsapp Msg Sent", flags: 64})
       }

         if(interaction.customId.split("_")[0] === "reject") {
          if(db.isRejected) return interaction.reply({content: "Already Rejected", flags: 64});
            const modal = new ModalBuilder()
            .setCustomId(`reason_${dbId}`)
            .setTitle('Rejection Reason');
    
        const reasonInput = new TextInputBuilder()
            .setCustomId('reasontext')
            .setLabel('Reson')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter The Reason Of Rejection')
            .setRequired(true);
    
     
    
        const firstRow = new ActionRowBuilder().addComponents(reasonInput);
    
        modal.addComponents(firstRow);
    
        await interaction.showModal(modal);
         }


         if(interaction.customId.split("_")[0] === "email") {
            const modal = new ModalBuilder()
            .setCustomId(`cemail_${dbId}`)
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


         if (interaction.isModalSubmit() && interaction.customId.split("_")[0] === "cemail") {
            const subject = interaction.fields.getTextInputValue('email_subject');
            const content = interaction.fields.getTextInputValue('email_content');
             await sendMail(db.emailAddress, subject, {}, "custom", content).then(() => {
                console.log("Email Sent")
            }).catch((err) => {
                console.log(err)
            });
        
            await interaction.reply({ content: 'Custom email has been sent successfully!', flags: 64 });
        }
        

        if (interaction.isModalSubmit() && interaction.customId.split("_")[0] === "reason") {
        
            interaction.reply({ content: 'Wait Sending Message...', flags: 64 });
            const reason = interaction.fields.getTextInputValue('reasontext');

            const msg = rejectMsg(db.teamIgl, db.teamName, reason);
            await sendWhatsAppMessage(db.teamLeaderContactWhatsapp, msg).then(() => {
                console.log("WhatsApp Message Sent")
            }).catch((err) => {
                console.log(err)
            });

             await sendMail(db.emailAddress, "Your Registration Got Rejected !", data, "reject", null, reason).then(() => {
                console.log("Email Sent")
            }).catch((err) => {
                console.log(err)
            });
        
            db.isRejected = true;
            await db.save();
            await interaction.followUp({ content: 'Rejection Email & Whatsapp Msg Sucessfully Send', flags: 64 });
        }


    }
}