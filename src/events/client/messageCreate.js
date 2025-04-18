import { radeon as client } from "../../index.js";
export default {
    name: "messageCreate",
    async run(message) {
        const channelMap = {
            "983305521949995008": { targets: ["1217404323273773056"], role: "1217409658537513082" },//3pm
            "999669804975783966": { targets: ["1217404351472205855"], role: "1217409856466583594" },//4pm
            "1095460011477569607": { targets: ["1217404376134451200"], role: "1217409901664407572" },//5pm
            "1095460357633482932": { targets: ["1217404402256576542"], role: "1217409961349353482" },//6pm
            "1034797289643966464": { targets: ["1217404427464605706"], role: "1217410048196608041" },//7pm
            "1034797368945672192": { targets: ["1217404452697542708"], role: "1217410098251567134" },//8pm
            "1034797487858384896": { targets: ["1222799120582967346"], role: "1223869799277527130" },//9pm
            "1034797555030163536": { targets: ["1222799167676612649"], role: "1223869999974842408" },//10pm
            "1116226269718261840": { targets: ["1221864715861622804"], role: "1221884509356818593" },//11pm
            "999669804975783966": { targets: ["1217404351472205855"], role: "1217404376134451200" },//12pm

        };
;

        if (channelMap[message.channel.id]) {
         const match = message.content.match(/ID:\s*\d+\s*\n\s*PASSWORD:\s*\w+\s*\n\s*MAP:\s*\w+\s*\n\s*START TIME:\s*\d+:\d+\s*[APMapm]+/i);
            
            if (match) {
                const { targets, role } = channelMap[message.channel.id];
                for (const channelId of targets) {
                    const targetChannel = await client.channels.fetch(channelId).catch(() => null);
                    if (targetChannel) {
                        targetChannel.send({
                            content: `# GFXMETA T3 SCRIMS ID & PASS\n${match[0]}\n\nIDP RULES :
JOIN VC FOR ANY KICK REQUESTS.
ARRIVE 7 MINUTES EARLY TO ENSURE YOUR SPOT.
LAST KICK REQUEST ACCEPTED BY 2:57PM.
LATE ARRIVAL = SLOT FORFEITED, MANAGEMENT WON'T BE RESPONSIBLE.
FAILURE TO JOIN ON TIME MEANS YOUR SLOT MAY BE REASSIGNED.

ARRIVE 4 MINUTES BEFORE START, AFTER THAT YOUR SLOT IS YOUR RESPONSIBILITY.\n<@&${role}> Join Fast ASAP`,
                            allowedMentions: { roles: [role] }
                        });
                    }
                }
            }
        }


        let cmds = await client.commands.filter(v => v.type === "messageCreate");
        cmds.forEach(cmd => {
            cmd.execute(client, message)
        });
    }
}
