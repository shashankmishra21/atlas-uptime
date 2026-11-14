import { randomUUIDv7 } from "bun";
import type { OutgoingMessage, SignupOutgoingMessage } from "@repo/common";
import { keypair, HUB_WS_URL } from "./config/config.ts";
import { signMessage } from "./crypto/sign.ts";
import { validateHandler } from "./core/checker.ts";

const CALLBACKS: { [callbackId: string]: (data: SignupOutgoingMessage) => void } = {};
let validatorId: string | null = null;

async function main() {
    console.log("Validator Public Key:", keypair.publicKey.toBase58());
    console.log(`Connecting to Hub at ${HUB_WS_URL}...`);
    
    const ws = new WebSocket(HUB_WS_URL);

    ws.onopen = async () => {
        console.log("✅ Connected to Hub");

        const callbackId = randomUUIDv7();

        CALLBACKS[callbackId] = (data: SignupOutgoingMessage) => {
            validatorId = data.validatorId;
            console.log("✅ Received validatorId:", validatorId);
        };

        const signedMessage = await signMessage(
            `Signed message for ${callbackId}, ${keypair.publicKey}`,
            keypair
        );

        ws.send(
            JSON.stringify({
                type: "signup",
                data: {
                    callbackId,
                    ip: "127.0.0.1",
                    publicKey: keypair.publicKey,
                    signedMessage,
                },
            })
        );
    };

    ws.onmessage = async (event) => {
        console.log("📩Message from Hub:", event.data);

        const data: OutgoingMessage = JSON.parse(event.data as string);

        if (data.type === "signup") {
            CALLBACKS[data.data.callbackId]?.(data.data);
            delete CALLBACKS[data.data.callbackId];
        } else if (data.type === "validate") {
            await validateHandler(ws, data.data, keypair, validatorId);
        }
    };

    ws.onerror = (err) => {
        console.error("❌ WebSocket Error:", err);
    };

    ws.onclose = () => {
        console.log("❌ Connection closed. Reconnecting in 5 seconds...");
        setTimeout(main, 5000); // Auto-reconnect strategy for production resilience
    };
}

main();