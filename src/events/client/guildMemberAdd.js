import { radeon as client } from "../../index.js";
export default {
    name: "guildMemberAdd",
    async run(member) {
        let cmds = await client.commands.filter(v => v.type === "guildMemberAdd");
        cmds.forEach(cmd => {
            cmd.execute(client, member)
        });
    }
}