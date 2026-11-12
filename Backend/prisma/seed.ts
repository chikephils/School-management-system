import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaClient, StaffTitle, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'superadmin@chirevaedu.com';
  const password = 'password123';

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('SuperAdmin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      staffProfile: {
        create: {
          staffNumber: 'CHI-001',
          email,
          title: StaffTitle.DR,
          firstName: 'System',
          lastName: 'Administrator',
          phoneNumber: '07032359868',
          profileImageUrl: 'https://example.com/superadmin.jpg',
        },
      },
    },
  });

  console.log('SuperAdmin created successfully');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
