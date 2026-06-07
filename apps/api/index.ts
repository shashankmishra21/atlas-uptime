import express from 'express';
import { authMiddleware } from './middleware';
import { prismaClient } from 'db/client';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/website", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId!;
        const { url } = req.body;

        console.log("========== CREATE WEBSITE ==========");
        console.log("USER ID:", userId);
        console.log("BODY:", req.body);
        console.log("URL:", url);

        const data = await prismaClient.website.create({
            data: {
                userId,
                url
            }
        });

        res.json({
            id: data.id
        });

    } catch (error: any) {
        console.log("========== ERROR ==========");
        console.log("CODE:", error.code);
        console.log("MESSAGE:", error.message);
        console.log("META:", error.meta);
        console.dir(error, { depth: null });

        res.status(500).json({
            success: false,
            code: error.code,
            message: error.message,
            meta: error.meta
        });
    }
});

app.get("/api/v1/website/status", authMiddleware, async (req, res) => {
    const websiteId = req.query.websiteId! as unknown as string;
    const userId = req.userId;

    const data = await prismaClient.website.findFirst({
        where: {
            id: websiteId,
            userid: userId,
            disabled: false
        },
        include: {
            ticks: true
        }
    })

    res.json(data);
})

app.get("/api/v1/websites", authMiddleware, async (req, res) => {
    const userId = req.userId;

    const websites = await prismaClient.website.findMany({
        where: {
            userId,
            disabled: false
        },
        include: {
            ticks: true
        }
    })

    res.json({
        websites
    })
})

app.delete("/api/v1/website", authMiddleware, async (req, res) => {
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
    })

    res.json({
        message: "Deleted wWebsite SUCCESSFULLY"
    });

});


app.listen(8080, () => {
  console.log("API running on port 3000");
});