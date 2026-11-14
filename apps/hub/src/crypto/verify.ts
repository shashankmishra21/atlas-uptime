import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";

export async function verifyMessage(message: string, publicKey: string, signature: string): Promise<boolean> {
    try {
        const messageBytes = nacl_util.decodeUTF8(message);
        return nacl.sign.detached.verify(
            messageBytes,
            new Uint8Array(JSON.parse(signature)),
            new PublicKey(publicKey).toBytes(),
        );
    } catch (err) {
        console.error("Signature verification failed:", err);
        return false;
    }
}