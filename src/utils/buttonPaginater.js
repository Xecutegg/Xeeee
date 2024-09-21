import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

export async function buttonPagination(m, pages) {
    try {
        let index = 0;
        
        // Define the buttons
        let first = new ButtonBuilder()
            .setCustomId('first')
            .setLabel('<<')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);
        
        let prev = new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('<')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);
        
        let close = new ButtonBuilder()
            .setCustomId('close')
            .setLabel('x')
            .setStyle(ButtonStyle.Danger);
        
        let next = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('>')
            .setStyle(ButtonStyle.Secondary);
        
        let last = new ButtonBuilder()
            .setCustomId('last')
            .setLabel('>>')
            .setStyle(ButtonStyle.Secondary);
        let buttons = new ActionRowBuilder().addComponents(first, prev, close, next, last);
        let msg = await m.reply({ embeds: [pages[index]], components: [buttons], fetchReply: true });
        let c = await msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15_000 });
        
        c.on('collect', async i => {
            if (i.user.id !== m.author.id) {
                return await i.reply({ content: 'This is not for you!', ephemeral: true });
            }
            await i.deferUpdate();
            
            if (i.customId === 'prev') {
                if (index > 0) {
                    index--;
                }
            } else if (i.customId === 'next') {
                if (index < pages.length - 1) {
                    index++;
                }
            } else if (i.customId === 'first') {
                index = 0;
            } else if (i.customId === 'last') {
                index = pages.length - 1;
            } else if (i.customId === 'close') {
                c.stop();
                return await msg.edit({ embeds: [pages[index]], components: [] });
            }

            // Update button states
            first.setDisabled(index === 0);
            prev.setDisabled(index === 0);
            next.setDisabled(index === pages.length - 1);
            last.setDisabled(index === pages.length - 1);

            // Edit the message with the new embed and buttons
            await msg.edit({ embeds: [pages[index]], components: [buttons] });
            c.resetTimer();
        });

        c.on('end', async () => {
            await msg.edit({ embeds: [pages[index]], components: [] });
        });
        
        return msg;
    } catch (error) {
        throw new Error(error.message);
    }
}
