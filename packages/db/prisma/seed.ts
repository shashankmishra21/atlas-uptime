
import { prismaClient } from "../src";

const USER_ID = "6";

async function seed() {
    console.log("Creating user");
    await prismaClient.user.create({
        data: {
            id: USER_ID,
            email: "test@test.com",
        }
    })

    console.log("Creating website");
    const website = await prismaClient.website.create({
        data: {
            url: "https://test.com",
            userId: USER_ID
        }
    })

    console.log("Creating validator");
    const validator = await prismaClient.validator.create({
        data: {
            publicKey: "0x12341223123",
            location: "Delhi",
            ip: "127.0.0.1",
        }
    })

    await prismaClient.websiteTick.create({
        data: {
            websiteId: website.id,
            status: "Good",
            createdAt: new Date(),
            latency: 100,
            validatorId: validator.id
        }
    })

    await prismaClient.websiteTick.create({
        data: {
            websiteId: website.id,
            status: "Good",
            createdAt: new Date(Date.now() - 1000 * 60 *10),
            latency: 100,
            validatorId: validator.id
        }
    })

    await prismaClient.websiteTick.create({
        data: {
            websiteId: website.id,
            status: "Bad",
            createdAt: new Date(Date.now() - 1000 * 60 * 20),
            latency: 100,
            validatorId: validator.id
        }
    })
}

seed()
  .then(async () => {
    console.log("Seed completed");
    await prismaClient.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });