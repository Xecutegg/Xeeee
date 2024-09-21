import { Colors, EmbedBuilder } from "discord.js";
import WelcomeSettings from "../../database/models/welcome.js";
import { buttonPagination } from "../../utils/buttonPaginater.js";

export default {
    name: "welcome-list",
    description: "List all welcome channels",
    usage: "",
    category: "welcomer",
    aliases: ['list-welcome ', "wl", "welcomelist", "listwelcome"],
    botperms: ["ManageChannels"],
    userperms: ["ManageChannels"],
    async execute(client, message, args) {
        try {
            let lists = await WelcomeSettings.find({ guildId: message.guild.id });
            if (lists.length === 0) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("No Welcome Channels Found!")
                            .setDescription("It seems like we don't have any welcome channels set up yet. 🎉")
                            .addFields(
                                { name: "Start a New Welcome Setup", value: `You can easily set up a welcome channel by using the command \`${client.prefix}welcome-setup\`. This will guide you through configuring a new welcome message and channel.` },
                                { name: "Need Help?", value: `If you have any questions or need assistance, feel free to ask in the support channel or contact an admin.` }
                            )
                            .setColor(Colors.Green)
                            .setFooter({ text: "We're here to help you get started!" })
                    ]
                });
            }

            let embeds = [];
            for (let i = 0; i < lists.length; i += 10) {
                const welcomeList = lists.slice(i, i + 10);
                let description = welcomeList
                    .map((w, index) => `\`${index + 1}\` - <#${w.channelId}> \`${w.channelId}\``)
                    .join('\n');

                embeds.push(new EmbedBuilder()
                    .setTitle(`Welcome Channels for ${message.guild.name}`)
                    .setDescription(description)
                    .setFooter({ text: `Page ${Math.floor(i / 10) + 1} of ${Math.ceil(lists.length / 10)}`, iconURL: message.guild.iconURL() })
                    .setColor(Colors.Green)
                );
            }

            buttonPagination(message, embeds);
        } catch (error) {
            console.error(error.message);
            message.reply(`An error occurred: ${error.message}`);
        }
    }
}
