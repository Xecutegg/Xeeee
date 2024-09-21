import { radeon as client } from "../../index.js";
export default {
    name: "messageCreate",
    async run(message) {
        let cmds = await client.commands.filter(v => v.type === "messageCreate");
        cmds.forEach(cmd => {
            cmd.execute(client, message)
        });
    }
}
