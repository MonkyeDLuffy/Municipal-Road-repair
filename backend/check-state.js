import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await p.$connect();
  
  // Check current state
  const userCount = await prisma.user.count();
  const reportCount = await prisma.report.count();
  const taskCount = await prisma.task.count();
  const teamCount = await prisma.team.count();
  
  console.log('Current state:');
  console.log(`  Users: ${userCount}`);
  console.log(`  Reports: ${reportCount}`);
  console.log(`  Tasks: ${taskCount}`);
  console.log(`  Teams: ${teamCount}`);
  
  // List all users with employeeId
  const users = await prisma.user.findMany({
    select: { employeeId: true, role: true, name: true },
    orderBy: { employeeId: true }
  });
  console.log('\nAll users:');
  users.forEach(u => console.log(`  ${u.employeeId} - ${u.role} - ${u.name}`));
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });