import AutoResponder from "../../database/models/autoResponder.js";
import { EmbedBuilder } from "discord.js";

export default {
    name: "autoresponder-create",
    category: "autoresponder",
    description: "Create a new auto-response (Text or Embed)",
    usage: "autorespondercreate <trigger> <response>",
    botperms: ["SendMessages"],
    userperms: ["ManageGuild"],
    aliases: ["ar-create"],

    async execute(client, message, args) {
        try {
            if (args.length < 2) {
                return message.reply("❌ Usage: `autoresponder-create <trigger> <response>` OR `autoresponder-create <trigger> embed <title>|<description>|<color>`");
            }

            const trigger = args[0].toLowerCase();
            let response;
            let isEmbed = false;
            let embedOptions = {};

            // **Check if an autoresponder already exists**
            const existingResponder = await AutoResponder.findOne({
                guildId: message.guild.id,
                trigger: trigger
            });

            if (existingResponder) {
                return message.reply("❌ An autoresponder with this trigger already exists!");
            }

            // **Check if the user wants to create an embed response**
            if (args[1].toLowerCase() === "embed") {
                isEmbed = true;
                const embedData = args.slice(2).join(" ").split("|");

                if (embedData.length < 3) {
                    return message.reply("❌ Usage: `autoresponder-create <trigger> embed <title>|<description>|<color>`");
                }

                embedOptions = {
                    title: embedData[0],
                    description: embedData[1],
                    color: embedData[2]
                };

                response = null;
            } else {
                response = args.slice(1).join(" ");
            }

            // **Save new AutoResponder to DB**
            const newResponder = new AutoResponder({
                guildId: message.guild.id,
                trigger,
                response,
                isEmbed,
                embedOptions: isEmbed ? embedOptions : null,
                createdBy: message.author.id,
                status: true
            });

            await newResponder.save();

            return message.reply(`✅ Autoresponder created!\nTrigger: \`${trigger}\`\n${isEmbed ? "Embed response created." : `Response: \`${response}\``}`);
        } catch (error) {
            console.error("AutoResponder Create Command Error:", error);
            return message.reply("❌ An error occurred while creating the autoresponder.");
        }
    }
};
