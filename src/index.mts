import { connectDB, disconnectDB } from "./config/prisma-client.mts";
import { app } from "./app.mts";

const port = 3000;

await connectDB();

Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`Server laeuft auf http://localhost:${port}`);

process.on("SIGINT", () => {
  void (async () => {
    await disconnectDB();
    console.log("Der Server wird heruntergefahren.");
    process.exit(0);
  })();
});
