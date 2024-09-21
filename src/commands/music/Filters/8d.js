import { Message, PermissionFlagsBits, Client, EmbedBuilder, Colors } from "discord.js";
import discord from "discord.js";

export default {
    name: "8d",
    description: `Applies a 8D Filter`,
    userperms: ['SendMessages'],
    botperms: ['SendMessages'],
    category: "Filters",
    inVc: true,
    sameVc: true,
    player: true,
    current: true,
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     * @param {String} prefix
     */
    async execute(client, message, args) {
        let player = client.poru.players.get(message.guild.id)
        player.filters.clearFilters();
        player.filters.setRotation({
            "rotationHz": 0.1,
        })
        player.filters.setTimescale({
            "speed": 1.0,
            "pitch": 1.0,
            "rate": 1.0

        })
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(`**8d** mode is now enabled.`)
        message.channel.send({ embeds: [embed] })
    },
};