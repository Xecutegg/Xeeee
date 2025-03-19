import { radeon as client } from "../../index.js";
import Registration from '../../database/models/registration.js';
import { sendMail } from "../../utils/send-mail.js";

export default {
    name: "interactionCreate",
    async run(interaction) {
       if(!interaction.member.roles.cache.has("1049278089684860980")) return interaction.reply({content: "Only Event Manager Can Use These button...", flags: 64 })
        interaction.reply({ content: "HUH Buttons Working...", flags: 64 })

       const dbId = interaction.customId.split("_")[1];

       const db = await Registration.findById(dbId);
       const players = db.players.map((player, index) => {
            return {
                name: player.inGameName,
            }
        })
       const data = { igl: db.teamIgl || "Cyclone", email: db.emailAddress, teamname: db.teamName, teamlogo: db.teamLogo, players };

       console.log(data)
    
       if(interaction.customId.split("_")[0] === "approve") {
        sendMail("cycloneaddon@gmail.com", "R",  data)

       }

    }
}