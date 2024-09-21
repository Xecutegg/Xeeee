import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, Colors } from 'discord.js';
import resolveUser from '../../utils/resolveUser.js';

export default {
    name: "banner",
    description: "Displays the banner of the specified user or your own banner with advanced options.",
    usage: "[user mention or user ID]",
    category: "utility",
    aliases: ["userbanner", "profilebanner"],
    async execute(client, message, args) {
        try {
            let user = await resolveUser(args.join(""));
            if (!user) return message.reply("User not found. Please provide a valid user mention or ID.");
            const fetchedUser = await client.users.fetch(user.id, { force: true, flags: ['BANNER'] });
            if (!fetchedUser.banner) {
                return message.reply("This user does not have a banner set.");
            }

            const formats = ["png", "jpg", "webp"];
            const sizes = [128, 256, 512, 1024, 2048];

            let selectedFormat = "png";
            let selectedSize = 512;

            const bannerEmbed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle(`${user.tag}'s Banner`)
                .setDescription("Choose the format and size using the dropdowns below.")
                .setImage(fetchedUser.bannerURL({ format: selectedFormat, size: selectedSize, dynamic: true }))
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

            const formatMenu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select-banner-format')
                        .setPlaceholder('Choose a banner format')
                        .addOptions(formats.map(format => ({
                            label: format.toUpperCase(),
                            value: format,
                            description: `Get banner in ${format} format`,
                        }))),
                );

            const sizeMenu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select-banner-size')
                        .setPlaceholder('Choose a banner size')
                        .addOptions(sizes.map(size => ({
                            label: `${size}x${size}`,
                            value: size.toString(),
                            description: `Get banner in ${size}x${size} resolution`,
                        }))),
                );

            const msg = await message.channel.send({ embeds: [bannerEmbed], components: [formatMenu, sizeMenu] });

            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

            collector.on('collect', async interaction => {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({ content: "You're not allowed to interact with this menu.", ephemeral: true });
                }

                if (interaction.customId === 'select-banner-format') {
                    selectedFormat = interaction.values[0];
                } else if (interaction.customId === 'select-banner-size') {
                    selectedSize = parseInt(interaction.values[0]);
                }

                bannerEmbed.setImage(fetchedUser.bannerURL({ format: selectedFormat, size: selectedSize, dynamic: true }));
                await interaction.update({ embeds: [bannerEmbed] });
            });

            collector.on('end', () => {
                msg.edit({ components: [] });
            });

        } catch (error) {
            console.error(`Error executing banner command: ${error.message}`);
            return message.reply('An error occurred while processing the command.');
        }
    }
};
