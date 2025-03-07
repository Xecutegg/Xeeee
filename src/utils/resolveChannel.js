import { ChannelType } from 'discord.js';

export default async (message, identifier) => {
    let channel = identifier.replace(/[<#>]/g, '');
    if (!isNaN(Number(channel))) {
        channel = await message.guild.channels.fetch(channel);
    } else {
        channel = message.guild.channels.cache.find(c => c.name === identifier || c.id === identifier);
    }

    if (!channel || channel.type !== ChannelType.GuildText) {
        return null;
    }

    return channel;
};
