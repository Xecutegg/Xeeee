import { EmbedBuilder } from "discord.js";
import { buttonPagination } from "../utils/buttonPaginater.js";

export default {
    name: "test",
    async execute(client, message, args) {
        message.reply(args.join(" "));

    }
}