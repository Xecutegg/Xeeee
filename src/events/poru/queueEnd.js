import { Colors } from "discord.js";
import { radeon as client } from "../../index.js";
import { EmbedBuilder } from "@discordjs/builders";

export default {
    name: "queueEnd",
    description: "Emitted when a queue ends.",
    async run(player) {
        try {
            if (player.message) {
                await player.message.delete().catch(() => []);
            }
            
            const channel = await client.channels.fetch(player.textChannel);
            const guildId = channel.guild.id;

            const guilddDB = await client.db.Guild.findOne({ guildId: guildId });
            const is247 = guilddDB.is247;

            if (is247) {
                const embed = new EmbedBuilder()
                    .setTitle("Queue Ended")
                    .setDescription(`The queue for ${channel.guild.name} has ended, but 24/7 mode is enabled. Waiting for the next song...`)
                    .setColor(Colors.Green);

                await channel.send({ embeds: [embed] });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("Queue Ended")
                .setDescription(`The queue for ${channel.guild.name} has ended. The player will be automatically removed from the voice channel in 10 seconds.\n - Enable 24/7 mode to keep playing your favorite songs continuously...`)
                .setColor(Colors.Green);

            await channel.send({ embeds: [embed] });
            setTimeout(() => {
                if (player.queue.length === 0) {
                    player.destroy();
                }
            }, 10000);
        } catch (error) {
            console.error("Error in queueEnd:", error);
        }
    }
};
