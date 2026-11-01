import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.upsert({
        where: { email: 'admin@smartwaste.id' },
        update: {},
        create: {
            name: 'Administrator',
            email: 'admin@smartwaste.id',
            password: await bcrypt.hash('Admin123!', 10),
            role: 'ADMIN',
        },
    });
    console.log('Seed selesai');
}

main().finally(() => prisma.$disconnect());