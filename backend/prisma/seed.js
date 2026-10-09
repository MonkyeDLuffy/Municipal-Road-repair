import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('123456789', 10);

  const admin = await prisma.user.upsert({
    where: { employeeId: 'ADM-1001' },
    update: {},
    create: {
      employeeId: 'ADM-1001',
      name: 'Earth',
      email: 'admin@municipal.gov',
      passwordHash: adminPasswordHash,
      role: 'admin',
      status: 'active',
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { employeeId: 'SUP-1001' },
    update: {},
    create: {
      employeeId: 'SUP-1001',
      name: 'Supervisor Singh',
      email: 'supervisor@municipal.gov',
      passwordHash,
      role: 'supervisor',
      status: 'active',
    },
  });

  const workers = [
    {
      employeeId: 'WRK-1001',
      name: 'Raj Sharma',
      email: 'raj.sharma@municipal.gov',
      passwordHash,
      role: 'worker',
      status: 'active',
    },
    {
      employeeId: 'WRK-1002',
      name: 'Amit Kumar',
      email: 'amit.kumar@municipal.gov',
      passwordHash,
      role: 'worker',
      status: 'active',
    },
    {
      employeeId: 'WRK-1003',
      name: 'Mohan Singh',
      email: 'mohan.singh@municipal.gov',
      passwordHash,
      role: 'worker',
      status: 'active',
    },
    {
      employeeId: 'WRK-1004',
      name: 'Rahul Verma',
      email: 'rahul.verma@municipal.gov',
      passwordHash,
      role: 'worker',
      status: 'active',
    },
  ];

  for (const worker of workers) {
    await prisma.user.upsert({
      where: { employeeId: worker.employeeId },
      update: worker,
      create: worker,
    });
  }

  const team = await prisma.team.upsert({
    where: { name: 'Road Crew A' },
    update: {},
    create: { name: 'Road Crew A' },
  });

  const teamB = await prisma.team.upsert({
    where: { name: 'Road Crew B' },
    update: {},
    create: { name: 'Road Crew B' },
  });

  const worker1 = await prisma.user.findUnique({ where: { employeeId: 'WRK-1001' } });
  const worker2 = await prisma.user.findUnique({ where: { employeeId: 'WRK-1002' } });
  const worker3 = await prisma.user.findUnique({ where: { employeeId: 'WRK-1003' } });
  const worker4 = await prisma.user.findUnique({ where: { employeeId: 'WRK-1004' } });

  await prisma.user.update({
    where: { id: worker1.id },
    data: { teamId: team.id },
  });
  await prisma.user.update({
    where: { id: worker2.id },
    data: { teamId: team.id },
  });
  await prisma.user.update({
    where: { id: worker3.id },
    data: { teamId: teamB.id },
  });
  await prisma.user.update({
    where: { id: worker4.id },
    data: { teamId: teamB.id },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks = [
    {
      taskId: 'TASK-101',
      title: 'Large Pothole Repair',
      description: 'Repair large pothole on Main Street near intersection',
      location: 'Ward 12, Jaipur',
      latitude: 26.9124,
      longitude: 75.7873,
      priority: 'HIGH',
      status: 'assigned',
      requiredSkill: 'asphalt_repair',
      scheduledDate: new Date(today.getTime() + 2 * 60 * 60 * 1000),
      startTime: '10:00',
      endTime: '12:00',
      workerId: worker1.id,
      teamId: team.id,
    },
    {
      taskId: 'TASK-102',
      title: 'Road Crack Repair',
      description: 'Seal cracks on Highway 12 section',
      location: 'Ward 12, Jaipur',
      latitude: 26.9150,
      longitude: 75.7900,
      priority: 'MEDIUM',
      status: 'completed',
      requiredSkill: 'crack_sealing',
      scheduledDate: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      startTime: '14:00',
      endTime: '16:00',
      workerId: worker1.id,
      teamId: team.id,
    },
    {
      taskId: 'TASK-103',
      title: 'Pothole Repair - Sector 5',
      description: 'Multiple potholes on residential road',
      location: 'Ward 8, Jaipur',
      latitude: 26.9200,
      longitude: 75.8000,
      priority: 'HIGH',
      status: 'in_progress',
      requiredSkill: 'asphalt_repair',
      scheduledDate: new Date(today.getTime() + 4 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '11:30',
      workerId: worker1.id,
      teamId: team.id,
    },
    {
      taskId: 'TASK-104',
      title: 'Large Pothole Repair',
      description: 'Deep pothole near school zone',
      location: 'Ward 15, Jaipur',
      latitude: 26.9000,
      longitude: 75.7800,
      priority: 'HIGH',
      status: 'assigned',
      requiredSkill: 'asphalt_repair',
      scheduledDate: new Date(today.getTime() + 14 * 60 * 60 * 1000),
      startTime: '14:00',
      endTime: '16:30',
      workerId: worker2.id,
      teamId: team.id,
    },
    {
      taskId: 'TASK-105',
      title: 'Road Resurfacing Prep',
      description: 'Prepare surface for resurfacing',
      location: 'Ward 10, Jaipur',
      latitude: 26.9100,
      longitude: 75.7950,
      priority: 'MEDIUM',
      status: 'completed',
      requiredSkill: 'surface_prep',
      scheduledDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      startTime: '08:00',
      endTime: '12:00',
      workerId: worker2.id,
      teamId: team.id,
    },
    {
      taskId: 'TASK-106',
      title: 'Manhole Cover Replacement',
      description: 'Replace damaged manhole cover',
      location: 'Ward 3, Jaipur',
      latitude: 26.9300,
      longitude: 75.8100,
      priority: 'URGENT',
      status: 'assigned',
      requiredSkill: 'manhole_repair',
      scheduledDate: new Date(today.getTime() + 6 * 60 * 60 * 1000),
      startTime: '10:00',
      endTime: '11:00',
      workerId: worker3.id,
      teamId: teamB.id,
    },
    {
      taskId: 'TASK-107',
      title: 'Shoulder Repair',
      description: 'Repair eroded road shoulder',
      location: 'Ward 18, Jaipur',
      latitude: 26.8900,
      longitude: 75.7700,
      priority: 'LOW',
      status: 'completed',
      requiredSkill: 'shoulder_repair',
      scheduledDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
      startTime: '13:00',
      endTime: '15:00',
      workerId: worker3.id,
      teamId: teamB.id,
    },
    {
      taskId: 'TASK-108',
      title: 'Drainage Clearing',
      description: 'Clear blocked roadside drainage',
      location: 'Ward 22, Jaipur',
      latitude: 26.8800,
      longitude: 75.7600,
      priority: 'MEDIUM',
      status: 'assigned',
      requiredSkill: 'drainage',
      scheduledDate: new Date(today.getTime() + 22 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '11:00',
      workerId: worker4.id,
      teamId: teamB.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { taskId: task.taskId },
      update: task,
      create: task,
    });
  }

  const demoCitizen = await prisma.citizen.upsert({
    where: { email: 'citizen@demo.com' },
    update: {},
    create: {
      authUserId: 'demo-citizen-auth-id',
      name: 'Demo Citizen',
      email: 'citizen@demo.com',
      role: 'citizen',
      status: 'active',
    },
  });

  const demoReports = [
    {
      reportNumber: 'RPT-2026-0001',
      citizenId: demoCitizen.id,
      title: 'Large pothole near school entrance',
      description: 'Large pothole causing problems for vehicles during school drop-off. Children at risk.',
      locationText: 'XYZ Road, Near ABC School, Jaipur',
      googleMapsUrl: 'https://maps.google.com/?q=26.9124,75.7873',
      latitude: 26.9124,
      longitude: 75.7873,
      status: 'submitted',
    },
    {
      reportNumber: 'RPT-2026-0002',
      citizenId: demoCitizen.id,
      title: 'Road crack on Highway 12',
      description: 'Multiple cracks developing on highway section, getting worse with rain.',
      locationText: 'Highway 12, Ward 8, Jaipur',
      googleMapsUrl: 'https://maps.google.com/?q=26.9150,75.7900',
      latitude: 26.9150,
      longitude: 75.7900,
      status: 'under_review',
    },
    {
      reportNumber: 'RPT-2026-0003',
      citizenId: demoCitizen.id,
      title: 'Manhole cover missing',
      description: 'Open manhole on main road, dangerous for two-wheelers at night.',
      locationText: 'Main Road, Ward 3, Jaipur',
      googleMapsUrl: 'https://maps.google.com/?q=26.9300,75.8100',
      latitude: 26.9300,
      longitude: 75.8100,
      status: 'in_progress',
    },
  ];

  for (const report of demoReports) {
    await prisma.report.upsert({
      where: { reportNumber: report.reportNumber },
      update: report,
      create: report,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('📋 Demo workers:');
  console.log('   WRK-1001 — Raj Sharma (password: password123)');
  console.log('   WRK-1002 — Amit Kumar (password: password123)');
  console.log('   WRK-1003 — Mohan Singh (password: password123)');
  console.log('   WRK-1004 — Rahul Verma (password: password123)');
  console.log('📋 Demo citizen:');
  console.log('   citizen@demo.com (password: password123) - requires Supabase Auth setup');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });