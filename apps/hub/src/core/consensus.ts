import { prismaClient } from "db/client";
import { PENDING_ROUNDS, type PendingRound } from "../state/store.ts";

export async function processMonitoringRound(round: PendingRound) {
    if (round.timeout) {
        clearTimeout(round.timeout);
    }

    if (!PENDING_ROUNDS[round.callbackId]) return;

    const goodResponses = round.responses.filter(r => r.status === "Good").length;
    const badResponses = round.responses.filter(r => r.status === "Bad").length;

    let finalStatus: "Good" | "Bad" | "Unknown";

    if (round.responses.length !== round.expectedResponses) {
        finalStatus = "Unknown";
    } else if (goodResponses > badResponses) {
        finalStatus = "Good";
    } else if (badResponses > goodResponses) {
        finalStatus = "Bad";
    } else {
        finalStatus = "Unknown";
    }

    // Store every validator's individual tick observation
    for (const response of round.responses) {
        await prismaClient.websiteTick.create({
            data: {
                websiteId: round.websiteId,
                validatorId: response.validatorId,
                status: response.status,
                latency: response.latency,
            },
        });
    }

    if (finalStatus !== "Unknown" && round.responses.length > 0) {
        const averageLatency =
            round.responses.reduce((sum, r) => sum + r.latency, 0) / round.responses.length;

        await prismaClient.website.update({
            where: { id: round.websiteId },
            data: {
                currentStatus: finalStatus,
                lastCheckedAt: new Date(),
                lastLatency: averageLatency,
            },
        });

        await prismaClient.monitoringRound.create({
            data: {
                websiteId: round.websiteId,
                status: finalStatus,
                latency: averageLatency,
            },
        });
    }

    console.log({
        website: round.websiteUrl,
        goodResponses,
        badResponses,
        expectedResponses: round.expectedResponses,
        receivedResponses: round.responses.length,
        finalStatus,
    });

    delete PENDING_ROUNDS[round.callbackId];
}