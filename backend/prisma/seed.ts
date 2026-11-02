import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 1. Akun Administrator
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

    // 2. Akun Warga (User)
    await prisma.user.upsert({
        where: { email: 'warga@smartwaste.id' },
        update: {},
        create: {
            name: 'Warga',
            email: 'warga@smartwaste.id',
            password: await bcrypt.hash('Warga123!', 10),
            role: 'USER',
        },
    });

    console.log('Seed selesai: Admin & Warga berhasil dibuat/diperbarui');
}

main().finally(() => prisma.$disconnect());
