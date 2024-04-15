import axios from 'axios';
import { setTimeout } from 'timers/promises';

async function sendPing() {
    const routes = ['/suppliers', '/products', '/orders', '/employees', '/customers'];
    const route = routes[Math.floor(Math.random() * routes.length)];
    const url = `https://northwind-iaum.onrender.com${route}?limit=1`;

    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            console.log(`Successfully pinged ${url}`);
        } else {
            console.error(`Failed to ping ${url}. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error while pinging ${url}:`, error);
    }
}

async function main() {
    while (true) {
        const delayMinutes = Math.floor(Math.random() * (15 - 5 + 1)) + 4; // Random delay between 5 and 14 minutes
        console.log(`Waiting for ${delayMinutes} minutes before next ping...`);
        await setTimeout(delayMinutes * 60 * 1000);
        await sendPing();
    }
}

main();

