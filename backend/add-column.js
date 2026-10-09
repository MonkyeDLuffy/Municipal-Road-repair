const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.\$executeRawUnsafe('ALTER TABLE "Reports" ADD COLUMN "expiresAt" DATETIME');
    console.log('Column expiresAt added to Reports table');
  } catch (e) {
    console.error('Error adding column:', e);
  } finally {
    await prisma.\$disconnect();
  }
}

main();