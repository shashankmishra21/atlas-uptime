import { Keypair } from "@solana/web3.js";
import dotenv from "dotenv";



dotenv.config({

    path: process.env.ENV_FILE || ".env",
    override: true,
});

console.log("ENV_FILE =", process.env.ENV_FILE);
console.log("Loaded PRIVATE_KEY starts with:", process.env.PRIVATE_KEY?.slice(0, 25));


if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY missing from environment variables!");
}

export const keypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY))
);

export const HUB_WS_URL = process.env.HUB_WS_URL || "ws://localhost:8081";