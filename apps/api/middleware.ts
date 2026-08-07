import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PUBLIC_KEY } from "./config";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader;

        const decoded = jwt.verify(token, JWT_PUBLIC_KEY);

        console.log(decoded);

        if (!decoded.sub) {
            return res.status(401).json({
                error: "Invalid token",
            });
        }

        req.userId = typeof decoded.sub === "string" ? decoded.sub : undefined;

        next();
    } catch (err) {
        console.error("JWT VERIFY ERROR:", err);

        return res.status(401).json({
            error: "Token verification failed",
        });
    }
}