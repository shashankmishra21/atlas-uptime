import express from 'express';
import cors from 'cors';
import { websiteRouter } from './routes/website.routes.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


//  Feature Routes
app.use("/api/v1/website", websiteRouter);


app.listen(PORT, () => {
    console.log(`API running cleanly on port ${PORT}`);
});