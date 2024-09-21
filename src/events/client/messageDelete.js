import { radeon as client } from "../../index.js";
export default {
    name: "messageDelete",
    async run(message) {
        let cmds = await client.commands.filter(v => v.type === "messageDelete");
        cmds.forEach(cmd => {
            cmd.execute(client, message)
        });
    }
}
