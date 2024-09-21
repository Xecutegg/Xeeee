import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, Colors } from 'discord.js';
import resolveUser from '../../utils/resolveUser.js';

export default {
    name: "avatar",
    description: "Displays the avatar of the specified user or your own avatar with advanced options.",
    usage: "[user mention or user ID]",
    category: "utility",
    aliases: ["pfp", "profilepic", "av"],
    async execute(client, message, args) {
        try {
            let user = await resolveUser(args.join(""));
            if (!user) return message.reply("User not found. Please provide a valid user mention or ID.");

            const formats = ["png", "jpg", "webp", "gif"];
            const sizes = [128, 256, 512, 1024];

            let selectedFormat = "png";
            let selectedSize = 512;

            const avatarEmbed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle(`${user.tag}'s Avatar`)
                .setDescription("Choose the format and size using the dropdowns below.")
                .setImage(user.displayAvatarURL({ format: selectedFormat, size: selectedSize, dynamic: true }))
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

            const formatMenu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select-format')
                        .setPlaceholder('Choose an avatar format')
                        .addOptions(formats.map(format => ({
                            label: format.toUpperCase(),
                            value: format,
                            description: `Get avatar in ${format} format`,
                        }))),
                );

            const sizeMenu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select-size')
                        .setPlaceholder('Choose an avatar size')
                        .addOptions(sizes.map(size => ({
                            label: `${size}x${size}`,
                            value: size.toString(),
                            description: `Get avatar in ${size}x${size} resolution`,
                        }))),
                );

            const msg = await message?.reply({ embeds: [avatarEmbed], components: [formatMenu, sizeMenu] });
            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });
            collector.on('collect', async interaction => {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({ content: "You're not allowed to interact with this menu.", ephemeral: true });
                }

                if (interaction.customId === 'select-format') {
                    selectedFormat = interaction.values[0];
                } else if (interaction.customId === 'select-size') {
                    selectedSize = parseInt(interaction.values[0]);
                }

                avatarEmbed.setImage(user.displayAvatarURL({ format: selectedFormat, size: selectedSize, dynamic: true }));
                await interaction.update({ embeds: [avatarEmbed] });
            });

            collector.on('end', () => {
                msg.edit({ components: [] });
            });

        } catch (error) {
            console.error(`Error executing avatar command: ${error.message}`);
            return message.reply('An error occurred while processing the command.');
        }
    }
};
