/* eslint-disable import/first */
/* eslint-disable import/order */
import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 10);
    await prisma.user.upsert({
        where: { email: process.env.DEFAULT_ADMIN_EMAIL },
        update: {},
        create: {
            name: "Super Administrator",
            email: process.env.DEFAULT_ADMIN_EMAIL,
            role: "ADMIN",
            password: password,
        },
    });
}

try {
    main();
    await prisma.$disconnect();
} catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
}
