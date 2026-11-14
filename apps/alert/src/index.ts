import { startEmailWorker } from "./workers/email.worker.ts";

console.log("Initializing Atlas Uptime Alert Worker Service...");

startEmailWorker();