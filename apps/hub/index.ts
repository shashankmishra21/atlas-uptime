import { randomUUIDv7, type ServerWebSocket } from "bun";
import type { IncomingMessage, SignupIncomingMessage } from "@repo/common";
import { prismaClient } from "db/client";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";

type ValidatorResponse = {
    validatorId: string;
    status: "Good" | "Bad";
    latency: number;
    receivedAt: Date;

};

type PendingRound = {
    websiteId: string;
    callbackId: string;
    responses: ValidatorResponse[];
    expectedResponses: number;
    timeout?: Timer;
    websiteUrl: string;
};

const availableValidators: { validatorId: string, socket: ServerWebSocket<unknown>, publicKey: string }[] = [];

const PENDING_ROUNDS: Record<string, PendingRound> = {};
const COST_PER_VALIDATION = 100; // in lamports

Bun.serve({
    // fetch(req, server) {
    //     //   if (server.upgrade(req)) {
    //     //     return;
    //     //   }

    //     if (server.upgrade(req, {
    //         data: {}
    //     })) {
    //         return;
    //     }
    //     return new Response("Upgrade failed", { status: 500 });
    // }
    fetch(req, server) {
        console.log("Incoming request:", req.url);

        if (server.upgrade(req, {
            data: {}
        })) {
            console.log("WebSocket upgraded");
            return;
        }

        console.log("Upgrade failed");
        return new Response("Upgrade failed", { status: 500 });
    },
    port: 8081,
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
                }

            } else if (data.type === "validate") {

                // Find the validator that sent this response
                const validator = availableValidators.find(
                    (v) => v.validatorId === data.data.validatorId
                );

                if (!validator) {
                    console.log(`Unknown validator ${data.data.validatorId}`);
                    return;
                }

                // Verify the signed response
                const verified = await verifyMessage(
                    `Replying to ${data.data.callbackId}`,
                    validator.publicKey,
                    data.data.signedMessage
                );

                if (!verified) {
                    console.log(`Invalid signature from ${data.data.validatorId}`);
                    return;
                }

                // Find the pending monitoring round
                const round = PENDING_ROUNDS[data.data.callbackId];

                if (!round) {
                    console.log(`No pending round found for callback ${data.data.callbackId}`);
                    return;
                }

                // Store the validator response
                round.responses.push({
                    validatorId: data.data.validatorId,
                    status: data.data.status,
                    latency: data.data.latency,
                    receivedAt: new Date()
                });

                console.log(
                    `Received response ${round.responses.length}/${round.expectedResponses} for callback ${data.data.callbackId}`
                );
            }
        },
        async close(ws: ServerWebSocket<unknown>) {
            availableValidators.splice(availableValidators.findIndex(v => v.socket === ws), 1);
        }
    },
});

async function signupHandler(ws: ServerWebSocket<unknown>, { ip, publicKey, signedMessage, callbackId }: SignupIncomingMessage) {
    const validatorDb = await prismaClient.validator.findFirst({
        where: {
            publicKey,
        },
    });

    if (validatorDb) {
        ws.send(JSON.stringify({
            type: 'signup',
            data: {
                validatorId: validatorDb.id,
                callbackId,
            },
        }));

        availableValidators.push({
            validatorId: validatorDb.id,
            socket: ws,
            publicKey: validatorDb.publicKey,
        });

        console.log(
            `Validator connected: ${validatorDb.id}`
        );

        console.log(
            `Currently connected: ${availableValidators.length}`
        );

        return;
    }

    // Given the ip, return the location
    const validator = await prismaClient.validator.create({
        data: {
            ip,
            publicKey,
            location: 'unknown',
        },
    });

    ws.send(JSON.stringify({
        type: 'signup',
        data: {
            validatorId: validator.id,
            callbackId,
        },
    }));

    availableValidators.push({
        validatorId: validator.id,
        socket: ws,
        publicKey: validator.publicKey,
    });
}

async function verifyMessage(message: string, publicKey: string, signature: string) {
    const messageBytes = nacl_util.decodeUTF8(message);
    const result = nacl.sign.detached.verify(
        messageBytes,
        new Uint8Array(JSON.parse(signature)),
        new PublicKey(publicKey).toBytes(),
    );

    return result;
}

setInterval(async () => {
    try {
        const websitesToMonitor = await prismaClient.website.findMany({
            where: {
                disabled: false,
            },
        });

        for (const website of websitesToMonitor) {

            const callbackId = randomUUIDv7();

            PENDING_ROUNDS[callbackId] = {
                websiteId: website.id,
                    websiteUrl: website.url,
                callbackId,
                responses: [],
                expectedResponses: availableValidators.length,
            };

            availableValidators.forEach((validator) => {

                console.log(
                    `Sending validate to ${validator.validatorId} ${website.url}`
                );

                validator.socket.send(
                    JSON.stringify({
                        type: "validate",
                        data: {
                            url: website.url,
                            callbackId,
                        },
                    })
                );


            });
        }
    } catch (err) {
        console.error("Hub monitoring cycle failed:", err);
    }
}, 60 * 1000);