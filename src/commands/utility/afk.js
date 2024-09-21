import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

export default {
    name: "afk",
    description: "Sets the user to AFK mode.",
    usage: "<reason>",
    category: "utility",
    async execute(client, message, args) {
        let reason = args.join(" ") || "I'm currently AFK.";
        try {
            const existingAFK = await client.db.Afk.findOne({
                userId: message.author.id,
                guildId: message.guild.id,
            });

            if (existingAFK) {
                return message.reply('You are already AFK.');
            }
            
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('server_afk')
                        .setLabel('Server AFK')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('global_afk')
                        .setDisabled(true)
                        .setLabel('Global AFK - Soon')
                        .setStyle(ButtonStyle.Success),
                );

            const msg = await message.reply({ content: "- Choose an AFK mode...", components: [buttons] });

            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15_000 });

            collector.on('collect', async i => {
                if (i.user.id !== message.author.id) {
                    return i.reply({ content: 'This is not for you!', ephemeral: true });
                }

                if (i.customId === 'server_afk') {
                    await client.db.Afk.create({
                        userId: message.author.id,
                        guildId: message.guild.id,
                        reason
                    });
                    await i.update({ content: `${message.author.tag} is now AFK: ${reason}`, components: [] });
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    msg.edit({components: [] });
                }
            });

        } catch (error) {
            console.error(`Error in afk command: ${error.message}`);
            message.reply('An error occurred while setting you as AFK.');
        }
    }
};
