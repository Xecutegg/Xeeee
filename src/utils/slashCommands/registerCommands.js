// Utility for registering slash commands
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';

export async function loadSlashCommands(client, folder) {
    try {
        if (!client.slashCommands) {
            client.slashCommands = new Map();
        }

        const slashCommandsData = [];
        const commandFiles = readdirSync(folder, { withFileTypes: true });
        
        for (const dirent of commandFiles) {
            const fullPath = path.join(folder, dirent.name);

            if (dirent.isDirectory()) {
                // Recursively load commands from subdirectories
                await loadSlashCommands(client, fullPath);
            } else if (dirent.isFile() && dirent.name.endsWith('.js')) {
                const fileURL = `file://${path.resolve(fullPath)}`;
                try {
                    const commandModule = await import(fileURL);
                    const command = commandModule.default;

                    if (command && command.data) {
                        client.slashCommands.set(command.data.name, command);
                        slashCommandsData.push(command.data.toJSON());
                        console.log(`✅ Loaded slash command: ${command.data.name} from ${fullPath}`);
                    } else {
                        console.error(`❌ Invalid slash command file: ${fullPath}`);
                    }
                } catch (error) {
                    console.error(`❌ Error loading slash command from ${fullPath}:`, error);
                }
            }
        }

        return slashCommandsData;
    } catch (error) {
        console.error('Error loading slash commands:', error);
        return [];
    }
}

export async function registerSlashCommands(client, commands, guildId = null) {
    try {
        if (!commands || commands.length === 0) {
            console.log('No slash commands to register');
            return;
        }

        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

        if (guildId) {
            // Guild-specific commands - faster to update but only work in specified guild
            console.log(`Started refreshing ${commands.length} guild (/) commands for guild ${guildId}`);
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, guildId),
                { body: commands },
            );
            console.log(`Successfully registered ${commands.length} guild (/) commands for guild ${guildId}`);
        } else {
            // Global commands - can take up to an hour to update but work in all guilds
            console.log(`Started refreshing ${commands.length} global (/) commands`);
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands },
            );
            console.log(`Successfully registered ${commands.length} global (/) commands`);
        }
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
}