import { randomUUIDv7 } from "bun";
import { prismaClient } from "db/client";
import { availableValidators, PENDING_ROUNDS, type PendingRound } from "../state/store.ts";
import { processMonitoringRound } from "./consensus.ts";

export function startMonitoringScheduler() {
    setInterval(async () => {
        try {
            if (availableValidators.length === 0) {
                console.log("No active validators connected. Skipping monitoring round.");
                return;
            }

            const websitesToMonitor = await prismaClient.website.findMany({
                where: { disabled: false },
            });

            for (const website of websitesToMonitor) {
                const callbackId = randomUUIDv7();

                const round: PendingRound = {
                    websiteId: website.id,
                    websiteUrl: website.url,
                    callbackId,
                    responses: [],
                    expectedResponses: availableValidators.length,
                };

                PENDING_ROUNDS[callbackId] = round;

                
                // Timeout fallback if validators don't respond within 5 seconds
                round.timeout = setTimeout(async () => {
                    console.log(`⏱️ Timeout reached for ${round.websiteUrl}. Received ${round.responses.length}/${round.expectedResponses}`);
                    await processMonitoringRound(round);
                }, 5000);

                availableValidators.forEach((validator) => {
                    validator.socket.send(
                        JSON.stringify({
                            type: "validate",
                            data: {
                                url: website.url,
                                callbackId,
                                websiteId: website.id,
                            },
                        })
                    );
                });
            }
        } 
        catch (err) {
            console.error("Hub monitoring cycle failed:", err);
        }
    }, 60 * 1000);

}