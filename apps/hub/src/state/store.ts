import type { ServerWebSocket } from "bun";

export type ConnectedValidator = {
    validatorId: string;
    socket: ServerWebSocket<unknown>;
    publicKey: string;
};

export type ValidatorResponse = {
    validatorId: string;
    status: "Good" | "Bad";
    latency: number;
    receivedAt: Date;
};

export type PendingRound = {
    websiteId: string;
    callbackId: string;
    responses: ValidatorResponse[];
    expectedResponses: number;
    timeout?: Timer;
    websiteUrl: string;
};

// Global in-memory stores for active sessions
export const availableValidators: ConnectedValidator[] = [];
export const PENDING_ROUNDS: Record<string, PendingRound> = {};