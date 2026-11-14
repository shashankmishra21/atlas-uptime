import { Worker, Job } from "bullmq";
import { Resend } from "resend";
import { redisConnection } from "../config/redis.ts";
import { prismaClient } from "db/client";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

interface EmailAlertJob {
  websiteId: string;
  url: string;
  status: string;
}


function getAlertHtml(url: string, status: string) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 600px; margin: auto;">
      <h2 style="color: #e53e3e;">Atlas Uptime Incident Alert</h2>
      <p>Hello,</p>
      <p>Your monitored website has experienced a status change.</p>
      <p><strong>URL:</strong> <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>
      <p><strong>Current Status:</strong> <span style="color: #e53e3e; font-weight: bold;">${status}</span></p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">Timestamp: ${new Date().toISOString()}</p>
    </div>
  `;
}

export function startEmailWorker() {
    
  const worker = new Worker<EmailAlertJob>(
    "email-alerts",
    async (job: Job<EmailAlertJob>) => {
      const { websiteId, url, status } = job.data;
      console.log(`[email-worker] Processing alert for ${url} (${status})`);

      const website = await prismaClient.website.findUnique({
        where: { id: websiteId },
      });

      if (!website) {
        console.warn(`[email-worker] Website ${websiteId} not found, skipping job ${job.id}`);
        return;
      }

      const user = await prismaClient.user.findUnique({
        where: { id: website.userId },
      });

      if (!user || !user.email) {
        console.warn(`[email-worker] User or email missing for website ${websiteId}, skipping job ${job.id}`);
        return;
      }

      try {
        const data = await resend.emails.send({
             from: process.env.EMAIL_FROM || "Atlas Uptime <onboarding@resend.dev>",
          to: [user.email],
           subject: `Uptime Alert: ${url} is currently ${status}`,
          html: getAlertHtml(url, status),
        });

        console.log(`[email-worker] Sent alert to ${user.email}:`, data);
      } catch (error) {
        console.error(`[email-worker] Failed to send alert for ${url}:`, error);
        throw error;
      }
    },
    {

      connection: redisConnection,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[email-worker] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[email-worker] Job ${job?.id} failed:`, err);
  });


  console.log("[email-worker] Started and listening for jobs");
  return worker;
}