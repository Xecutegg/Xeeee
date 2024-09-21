import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';

export const loadCommands = async (client, folder) => {
    try {
        if (!client.commands) {
            client.commands = new Collection();
        }

        const commandFolders = readdirSync(folder, { withFileTypes: true });
        for (const dirent of commandFolders) {
            const fullPath = path.join(folder, dirent.name);

            if (dirent.isDirectory()) {
                // Recursively load commands from subdirectories
                await loadCommands(client, fullPath);
            } else if (dirent.isFile() && dirent.name.endsWith('.js')) {
                const fileURL = `file://${path.resolve(fullPath)}`;
                try {
                    const commandModule = await import(fileURL);
                    const command = commandModule.default;

                    if (command && command.name) {
                        client.commands.set(command.name, command);
                        console.log(`✅ Loaded command: ${command.name} from ${fullPath}`);
                    } else {
                        console.error(`❌ Invalid command file: ${fullPath}`);
                    }
                } catch (importError) {
                    console.error(`❌ Error importing file: ${fullPath}`, importError);
                }
            }
        }
    } catch (error) {
        console.error(`❌ Error loading commands from folder: ${folder}`, error);
    }
    return client.commands;
};
