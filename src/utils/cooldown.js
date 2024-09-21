const cooldowns = new Map();

export async function applyCooldown(message, command) {
    const userId = message.author.id;
    const commandName = command.name;

    if (!cooldowns.has(userId)) {
        cooldowns.set(userId, new Map());
    }

    const userCooldowns = cooldowns.get(userId);

    if (userCooldowns.has(commandName)) {
        const cooldownInfo = userCooldowns.get(commandName);
        const remainingTime = (cooldownInfo - Date.now()) / 1000;

        if (remainingTime > 0) {
            let msg = await message.reply(`You are in cooldown for \`${commandName}\`.\nTry again in \`${remainingTime.toFixed(1)}\` seconds.`);
            setTimeout(() => {
                msg.delete().catch(() => { });
            }, 800);

            return false;
        }
    }

    let cooldownTime = (command.cooldown ? parseInt(command.cooldown) : 3) * 1000; // Default to 2 seconds if no cooldown is set
    userCooldowns.set(commandName, Date.now() + cooldownTime);
    setTimeout(() => {
        userCooldowns.delete(commandName);
        if (userCooldowns.size === 0) {
            cooldowns.delete(userId);
        }
    }, cooldownTime);

    return true;
}
