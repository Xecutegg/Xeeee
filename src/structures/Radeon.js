import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { loadCommands } from './radeonCommands.js';
import { Poru } from 'poru';
import { RadeonEvents } from './RadeonEvents.js';
import setupDatabase from '../database/index.js';
import Guild from '../database/models/Guild.js';
import Afk from '../database/models/afk.js';
import Snipe from '../database/models/snipe.js';
import Welcome from "../database/models/welcome.js";
import clientConfig from '../database/models/clientConfig.js';

const nodes = [

    {
        "Host": "v4.lavalink.rocks",
        "Port": 80,
        "Password": "horizxon.tech",
        "Secure": false
    }

];
const PoruOptions = {
    library: "discord.js",
    defaultPlatform: "ytsearch",
};
export class Radeon extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildVoiceStates
            ],
            partials: [
                Partials.Channel,
                Partials.User,
                Partials.Message,
                Partials.GuildMember
            ],
            allowedMentions: {
                repliedUser: true,
                parse: ['everyone', 'roles', 'users']
            }
        });
        this.poru = new Poru(this, nodes, PoruOptions);
        this.once('ready', async () => {
            this.db = { Guild, Afk, Snipe, Welcome, clientConfig };
            this.commands = await loadCommands(this, "./src/commands");
            this.events = new RadeonEvents(this).loadEvents();
            this.poru.init(this);
        });
        setupDatabase(process.env.MONGO_URL).then(() => {
            this.login(process.env.TOKEN);
        })
            .catch(err => {
                console.error(err);
                process.exit(1);
            })
        this.on('ready', async () => {
            console.log(`Logged in as ${this.user.tag}!`);
        })
        process.on('unhandledRejection', async (error) => {
            console.error('Unhandled Rejection:', error);
        });

        process.on('uncaughtException', async (error) => {
            console.error('Uncaught Exception:', error);
        });
    }
}
