import WelcomeSettings from "../../database/models/welcome.js";
import { buildEmbed } from "../../utils/buildEmbed.js";

export default {
    name: "Welcomehandler",
    isEvent: true,
    type: "guildMemberAdd",
    async execute(client, member) {
        try {
            let welcomes = await WelcomeSettings.find({ guildId: member.guild.id });
            if (welcomes.length === 0) return;

            for (let welcome of welcomes) {
                let msgContent = replacePlaceholders(welcome.welcomeMessage, member, member.guild);
                let options = welcome.embedOptions;
                let embed = options
                    ? await buildEmbed(await replacePlaceholdersInEmbed({ ...options }, member, member.guild)) : null;
                let toSend = {};
                if (welcome.type === "message") {
                    toSend.content = msgContent;
                } else if (welcome.type === "embed") {
                    toSend.embeds = [embed];
                } else {
                    toSend.content = msgContent;
                    if (embed) toSend.embeds = [embed];
                }

                const channel = client.channels.cache.get(welcome.channelId);
                if (channel) {
                    let msg = await channel.send(toSend);
                    if (welcome.deleteDuration !== "null") {
                        setTimeout(async () => {
                            await msg.delete();
                        }, parseInt(welcome.deleteDuration) * 60 * 1000);
                    }
                } else {
                    await WelcomeSettings.findOneAndDelete({ channelId: welcome.channelId })
                        .then(() => {
                            console.log(`Deleted welcome settings for channel ${welcome.channelId}.`);
                        })
                        .catch(err => {
                            console.error(`Error deleting welcome settings for channel ${welcome.channelId}: ${err.message}`);
                        });
                    console.error(`Channel with ID ${welcome.channelId} not found.`);
                }
            }
        } catch (error) {
            console.error(`Error handling welcome message: ${error.message}`);
        }
    }
};

export function replacePlaceholders(template, member, guild) {
    return template
        .replace(/{member.name}/g, member.user.username)
        .replace(/{member.tag}/g, `${member.user.tag}`)
        .replace(/{member.id}/g, member.id)
        .replace(/{member.avatar}/g, member.user.displayAvatarURL({ dynamic: true }))
        .replace(/{member.mention}/g, `<@${member.id}>`)
        .replace(/{member.createdAt}/g, member.user.createdAt.toDateString())
        .replace(/{member.joinedAt}/g, member.joinedAt.toDateString())
        .replace(/{server.name}/g, guild.name)
        .replace(/{server.id}/g, guild.id)
        .replace(/{server.members}/g, guild.memberCount)
        .replace(/{server.owner}/g, `<@${guild.ownerId}>`)
        .replace(/{server.icon}/g, guild.iconURL())
        .replace(/{server.boosts}/g, guild.premiumSubscriptionCount)
        .replace(/{server.boostTier}/g, guild.premiumTier);
}

export function replacePlaceholdersInEmbed(embed, member, guild) {
    if (embed.title) embed.title = replacePlaceholders(embed.title, member, guild);
    if (embed.description) embed.description = replacePlaceholders(embed.description, member, guild);
    if (embed.footer && embed.footer.text) embed.footer.text = replacePlaceholders(embed.footer.text, member, guild);
    if (embed.footer && embed.footer.iconURL) embed.footer.iconURL = replacePlaceholders(embed.footer.iconURL, member, guild);
    if (embed.author && embed.author.name) embed.author.name = replacePlaceholders(embed.author.name, member, guild);
    if (embed.author && embed.author.iconURL) embed.author.iconURL = replacePlaceholders(embed.author.iconURL, member, guild);

    // Ensure thumbnail and image are only updating the url property
    if (embed.thumbnail) {
        embed.thumbnail = replacePlaceholders(embed.thumbnail, member, guild);
    }
    if (embed.image) {
        embed.image = replacePlaceholders(embed.image, member, guild);
    }

    if (embed.fields) {
        embed.fields = embed.fields.map(field => ({
            name: replacePlaceholders(field.name, member, guild),
            value: replacePlaceholders(field.value, member, guild),
            inline: field.inline,
        }));
    }
    return embed;
}
