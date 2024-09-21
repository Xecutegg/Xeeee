import { readdirSync } from 'fs';
import ascii from 'ascii-table';

const table = new ascii().setHeading('Client Events', 'Status');
const table2 = new ascii().setHeading('Poru Events', 'Status');

export class RadeonEvents {
    constructor(client) {
        this.client = client;
        this.load = false;
    }

    async loadEvents() {
        // Load client events
        try {
            const clientEventsPath = './src/events/client';
            const clientFiles = readdirSync(clientEventsPath);

            for (const file of clientFiles) {
                if (file.endsWith('.js')) {
                    try {
                        const { default: event } = await import(`../events/client/${file}`);
                        if (event && typeof event.run === 'function') {
                            this.client.on(event.name, event.run.bind(event));
                            const name = file.split('.')[0];
                            table.addRow(name, '✅');
                        } else {
                            table.addRow(file, '❌');
                        }
                    } catch (error) {
                        console.error(`Failed to load client event ${file}: ${error.message}`);
                        table.addRow(file, '❌');
                    }
                }
            }

            console.log(table.toString());
        } catch (error) {
            console.error(`Failed to load client events: ${error.message}`);
        }

        // Load Poru events
        try {
            const poruEventsPath = './src/events/poru';
            const poruFiles = readdirSync(poruEventsPath);

            for (const file of poruFiles) {
                if (file.endsWith('.js')) {
                    try {
                        const { default: event } = await import(`../events/poru/${file}`);
                        if (event && typeof event.run === 'function') {
                            this.client.poru.on(event.name, event.run.bind(event));
                            const name = file.split('.')[0];
                            table2.addRow(event.name, '✅');
                        } else {
                            table2.addRow(event.name, '❌');
                        }
                    } catch (error) {
                        console.error(`Failed to load Poru event ${file}: ${error.message}`);
                        table2.addRow(file, '❌');
                    }
                }
            }

            console.log(table2.toString());
        } catch (error) {
            console.error(`Failed to load Poru events: ${error.message}`);
        }

        this.load = true;
        return this;
    }
}
