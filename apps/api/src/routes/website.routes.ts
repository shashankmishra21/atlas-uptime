import { Router } from 'express';
import { prismaClient } from 'db/client';
import { authMiddleware } from '../middlewares/middleware';

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId!;
        const { url } = req.body;

        const data = await prismaClient.website.create({
            data: { userId, url }
        });

        res.json({ id: data.id });
    } catch (error: any) {
        console.error("CREATE WEBSITE ERROR:", error);
        res.status(500).json({
            success: false,
            code: error.code,
            message: error.message,
            meta: error.meta
        });
    }
});

router.get("/status", authMiddleware, async (req, res) => {
    try {
        const websiteId = req.query.websiteId as string;
        const userId = req.userId;

        const data = await prismaClient.website.findFirst({
            where: {
                id: websiteId,
                userId: userId,
                disabled: false
            },
            include: {
                ticks: true,
                rounds: {
                    orderBy: { createdAt: "desc" },
                    take: 10
                }
            }
        });

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/all", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;

        const websites = await prismaClient.website.findMany({
            where: {
                userId,
                disabled: false
            },
            include: {
                rounds: {
                    orderBy: { createdAt: "desc" },
                    take: 30,
                },
            },
        });

        res.json({ websites });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId!;
        const websiteId = req.body.websiteId;

        await prismaClient.website.update({
            where: {
                id: websiteId,
                userId
            },
            data: {
                disabled: true,
            }
        });

        res.json({
            message: "Deleted website SUCCESSFULLY"
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export const websiteRouter = router;