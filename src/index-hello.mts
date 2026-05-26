import Bun from 'bun';
import { Hono } from 'hono';

export const app = new Hono();

app.get('/', (c) => c.json({ msg: 'Hello World' }));

Bun.serve({ port: 3000, fetch: app.fetch });

console.log('Der Server http://localhost:3000 ist gestartet');
