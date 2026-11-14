import { type ServerWebSocket } from "bun";
import { prismaClient } from "db/client";
import type { IncomingMessage, SignupIncomingMessage } from "@repo/common";
import { availableValidators, PENDING_ROUNDS } from "./state/store.ts";
import { verifyMessage } from "./crypto/verify.ts";
import { startMonitoringScheduler } from "./core/scheduler.ts";
import { processMonitoringRound } from "./core/consensus.ts";

const PORT = 8081;

Bun.serve({
    port: PORT,
    fetch(req, server) {
        if (server.upgrade(req, { data: {} })) {
            return;
        }
        return new Response("WebSocket upgrade failed", { status: 500 });
    },
    websocket: {
        async message(ws: ServerWebSocket<unknown>, message: string) {

            const data: IncomingMessage = JSON.parse(message);

            if (data.type === "signup") {
                const verified = await verifyMessage(
                    `Signed message for ${data.data.callbackId}, ${data.data.publicKey}`,
                    data.data.publicKey,
                    data.data.signedMessage
                );

                if (verified) {
                    await signupHandler(ws, data.data);
                } else {
                    console.log(" Invalid signup signature");
                }

            } else if (data.type === "validate") {
                const validator = availableValidators.find(
                    (v) => v.validatorId === data.data.validatorId
                );

                if (!validator) {
                    console.log(`Unknown validator ${data.data.validatorId}`);
                    return;
                }

                const verified = await verifyMessage(
                    `Replying to ${data.data.callbackId}`,
                    validator.publicKey,
                    data.data.signedMessage
                );

                if (!verified) {
                    console.log(`Invalid validation signature from ${data.data.validatorId}`);
                    return;
                }

                const round = PENDING_ROUNDS[data.data.callbackId];
                if (!round) return;

                const alreadyResponded = round.responses.some(
                    r => r.validatorId === data.data.validatorId
                );

                if (alreadyResponded) return;

                round.responses.push({
                    validatorId: data.data.validatorId,
                    status: data.data.status,
                    latency: data.data.latency,
                    receivedAt: new Date()
                });

                if (round.responses.length === round.expectedResponses) {
                    await processMonitoringRound(round);
                }
            }
        },
        async close(ws: ServerWebSocket<unknown>) {
            const index = availableValidators.findIndex(v => v.socket === ws);
            if (index !== -1) {
                availableValidators.splice(index, 1);

                console.log(`Validator disconnected. Active count: ${availableValidators.length}`);
            }
        }
    },
});

async function signupHandler(
    ws: ServerWebSocket<unknown>,
    { ip, publicKey, signedMessage, callbackId }: SignupIncomingMessage
) {
    let validatorDb = await prismaClient.validator.findFirst({
        where: { publicKey },
    });


    if (!validatorDb) {
        validatorDb = await prismaClient.validator.create({
            data: { ip, publicKey, location: 'unknown' },
        });
    }

    ws.send(JSON.stringify({
        type: 'signup',
        data: {
            validatorId: validatorDb.id,
            callbackId,
        },
    }));

    // Avoid duplicate pushes if same socket reconnects

    const existingIndex = availableValidators.findIndex(v => v.socket === ws);
    if (existingIndex === -1) {
        availableValidators.push({
            validatorId: validatorDb.id,
            socket: ws,
            publicKey: validatorDb.publicKey,
        });
    }

    console.log(`Validator connected: ${validatorDb.id} | Total active: ${availableValidators.length}`);
}

// Start the periodic website monitoring loop
startMonitoringScheduler();
console.log(`Hub Orchestrator running on port ${PORT}`);