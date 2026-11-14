import type { ValidateOutgoingMessage } from "@repo/common";
import { Keypair } from "@solana/web3.js";
import { signMessage } from "../crypto/sign.ts";

export async function validateHandler(
    ws: any,
    { url, callbackId, websiteId }: ValidateOutgoingMessage,
    keypair: Keypair,
    validatorId: string | null
) {
    console.log(`🔍 Validating website: ${url}`);
    const startTime = Date.now();
    const signature = await signMessage(`Replying to ${callbackId}`, keypair);

    try {
        const response = await fetch(url, {
            method: "GET",
            signal: AbortSignal.timeout(5000), // 5s timeout safety
        });
        const endTime = Date.now();
        const latency = endTime - startTime;
        const status = response.status;

        console.log(`🌐 URL: ${url} | Status: ${status} | Latency: ${latency}ms`);

        ws.send(
            JSON.stringify({
                type: 'validate',
                data: {
                    callbackId,
                    status: status === 200 ? 'Good' : 'Bad',
                    latency,
                    websiteId,
                    validatorId,
                    signedMessage: signature,
                },
            })
        );
    } catch (error) {
        const endTime = Date.now();
        const latency = endTime - startTime;

        ws.send(
            JSON.stringify({
                type: 'validate',
                data: {
                    callbackId,
                    status: 'Bad',
                    latency,
                    websiteId,
                    validatorId,
                    signedMessage: signature,
                },
            })
        );
        console.error(`❌ Check failed for ${url}:`, error);
    }
}