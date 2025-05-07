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
                                    `**Category:** ${command.category || 'General'}` +
                                    `${command.aliases ? `\n**Aliases:** ${command.aliases.join(', ')}` : ''}`)
                    .setColor(Colors.Blue)
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
                        .setColor(Colors.Blue)
                        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });
                    
                    return message.reply({ embeds: [embed] });
                } else {
                    return message.reply('No command or category found with that name.');
                }
            }
        }

        // Create a clean categories map
        const categoriesMap = new Map();
        
        // Collect actual commands from the client
        client.commands.forEach(command => {
            if (command.name && !command.isEvent && !command.hidden) {
                const category = command.category ? command.category.toLowerCase() : 'general';
                
                if (!categoriesMap.has(category)) {
                    categoriesMap.set(category, new Set());
                }
                
                categoriesMap.get(category).add(`\`${command.name}\``);
            }
        });
        
        // Convert to regular object with arrays
        const categories = {};
        for (const [category, commandsSet] of categoriesMap) {
            categories[category] = Array.from(commandsSet).sort();
        }
        
        // Define sticky messages manually to ensure they appear
        categories['sticky'] = ['`sticky`', '`sticky-delete`'];
        categories['idp'] = ['`idp-setup`'];
        
        // Define autoresponder commands in a single place
        // Remove any existing autoresponder categories first
        delete categories['autoresponder'];
        delete categories['auto-responder'];
        
        // Add a single, correct category
        categories['autoresponder'] = [
            '`autoresponder-create`', 
            '`autoresponderdelete`', 
            '`autoresponderlist`', 
            '`autoresponder-toggle`'
        ];
        
        // Build the embed
        const totalGuilds = client.guilds.cache.size;
        
        const embed = new EmbedBuilder()
            .setTitle('Help - Available Commands')
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setColor(Colors.Blue)
            .setDescription(`Prefix for this server is \`${prefix}\`\n\nUse \`${prefix}help [command name]\` to get more information about a specific command or \`${prefix}help [category name]\` to see commands in a specific category.`)
            .addFields({
                name: 'Bot Statistics',
                value: `Total guilds: ${totalGuilds}`,
                inline: false
            });

        // Add categories in a specific order
        const orderedCategories = [
            'general',
            'utility', 
            'mod',
            'autoresponder',
            'music',
            'sticky',
            'welcomer',
            'idp'
        ];
        
        // First add ordered categories
        orderedCategories.forEach(categoryKey => {
            if (categories[categoryKey] && categories[categoryKey].length > 0) {
                const displayName = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
                embed.addFields({
                    name: `${displayName} Commands`,
                    value: categories[categoryKey].join(', '),
                    inline: false
                });
                
                // Remove from categories to avoid duplication
                delete categories[categoryKey];
            }
        });
        
        // Then add any remaining categories
        for (const [category, commands] of Object.entries(categories)) {
            if (commands.length > 0) {
                const displayName = category.charAt(0).toUpperCase() + category.slice(1);
                embed.addFields({
                    name: `${displayName} Commands`,
                    value: commands.join(', '),
                    inline: false
                });
            }
        }

        message.reply({ embeds: [embed] });
    }
}
