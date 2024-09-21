import { Colors, EmbedBuilder } from 'discord.js';

export default {
    name: 'help',
    description: 'Displays all available commands or detailed information about a specific command.',
    aliases: ['commands', 'commandsList', 'h'],
    usage: '[command name|category name]',
    category: 'utility',
    async execute(client, message, args) {
        const prefix = client.prefix;

        if (args.length > 0) {
            const query = args.join(' ').toLowerCase();
            const command = client.commands.get(query) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(query));
            if (command) {
                // Command-specific help
                const embed = new EmbedBuilder()
                    .setTitle(`Help - ${command.name}`)
                    .setDescription(`**Description:** ${command.description || 'No description available'}\n` +
                                    `**Usage:** ${prefix}${command.name} ${command.usage || ''}\n` +
                                    `**Category:** ${command.category || 'General'}`)
                    .setColor(Colors.Green)
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });
                
                return message.reply({ embeds: [embed] });
            } else {
                // Check if it's a category
                const category = client.commands.filter(cmd => cmd.category && cmd.category.toLowerCase() === query);
                if (category.size > 0) {
                    const commands = category.map(cmd => `\`${cmd.name}\` - ${cmd.description || 'No description available'}`).join('\n');
                    
                    const embed = new EmbedBuilder()
                        .setTitle(`Help - ${query.charAt(0).toUpperCase() + query.slice(1)} Commands`)
                        .setDescription(commands || 'No commands found for this category.')
                        .setColor(Colors.Green)
                        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });
                    
                    return message.reply({ embeds: [embed] });
                } else {
                    return message.reply('No command or category found with that name.');
                }
            }
        }

        // General help with all categories and commands
        const categories = client.commands.reduce((acc, command) => {
            if (command.category && !acc[command.category]) {
                acc[command.category] = [];
            }
            if (command.category) {
                acc[command.category].push(`\`${command.name}\``);
            }
            return acc;
        }, {});

        const owner = await client.users.fetch('841319721860988931');
        const totalGuilds = client.guilds.cache.size;

        const embed = new EmbedBuilder()
            .setTitle('Help - Available Commands')
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setColor(Colors.Green)
            .setDescription(`Prefix for this server is \`${prefix}\`\n\nUse \`${prefix}help [command name]\` to get more information about a specific command or \`${prefix}help [category name]\` to see commands in a specific category.`)
            .addFields({
                name: 'Bot Statistics',
                value: `Total guilds: ${totalGuilds}`,
                inline: false
            });

        for (const [category, commands] of Object.entries(categories)) {
            embed.addFields({
                name: `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
                value: commands.length ? commands.join(', ') : 'No commands available',
                inline: false
            });
        }

        message.reply({ embeds: [embed] });
    }
}
