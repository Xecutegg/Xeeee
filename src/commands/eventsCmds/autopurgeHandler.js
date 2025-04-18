import AutoPurge from "../../models/AutoPurge.js";

export default async (client) => {
    setInterval(async () => {
        const purgeConfigs = await AutoPurge.find();

        for (const config of purgeConfigs) {
            const now = Date.now();
            const lastPurge = config.lastPurged?.getTime() || 0;

            if ((now - lastPurge) >= config.interval * 1000) {
                const guild = client.guilds.cache.get(config.guildId);
                if (!guild) continue;

                const channel = guild.channels.cache.get(config.channelId);
                if (!channel || !channel.isTextBased()) continue;

                try {
                    const fetched = await channel.messages.fetch({ limit: 100 });
                    const deletable = fetched.filter(msg =>
                        !msg.pinned &&
                        msg.createdTimestamp > Date.now() - 13 * 24 * 60 * 60 * 1000 &&
                        msg.mentions.users.size === 0 &&
                        msg.mentions.roles.size === 0
                    );

                    if (deletable.size > 0) {
                        await channel.bulkDelete(deletable, true);
                        console.log(`🧹 Purged ${deletable.size} message(s) in ${channel.name}`);
                    }

                    config.lastPurged = new Date();
                    await config.save();
                } catch (err) {
                    console.error(`Error auto-purging in ${config.channelId}:`, err);
                }
            }
        }
    }, 30 * 1000); // every 30s
};
