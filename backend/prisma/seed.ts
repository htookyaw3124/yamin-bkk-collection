import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const categories = [
    { name_en: 'Clothes (Man)', name_mm: 'အမျိုးသား အဝတ်အထည်', slug: 'clothes-man' },
    { name_en: 'Clothes (Woman)', name_mm: 'အမျိုးသမီး အဝတ်အထည်', slug: 'clothes-woman' },
    { name_en: 'Clothes (Child)', name_mm: 'ကလေး အဝတ်အထည်', slug: 'clothes-child' },
    { name_en: 'Watches', name_mm: 'နာရီ', slug: 'watches' },
    { name_en: 'Shoes', name_mm: 'ဖိနပ်', slug: 'shoes' },
    { name_en: 'Bags', name_mm: 'အိတ်', slug: 'bags' },
    { name_en: 'Accessories', name_mm: 'အသုံးအဆောင်များ', slug: 'accessories' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log('Categories seeded');
}

main()
  .catch((error) => {
    console.error('Seed error', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
