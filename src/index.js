// index.mjs
import { config } from 'dotenv';
import { Radeon } from './structures/Radeon.js';
config();

// Replace 'YOUR_BOT_TOKEN' with your actual bot token
export const radeon = new Radeon(process.env.TOKEN, '!');
