import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const owners = await prisma.owner.findMany({
    include: { dogs: true }
  });

  const emails = new Map();
  const phones = new Map();

  for (const owner of owners) {
    if (owner.email) {
      if (!emails.has(owner.email)) emails.set(owner.email, []);
      emails.get(owner.email).push(owner);
    }
    
    // Normalize phone for duplicate checking
    const normalizedPhone = owner.phone.replace(/\D/g, '');
    if (normalizedPhone) {
      if (!phones.has(normalizedPhone)) phones.set(normalizedPhone, []);
      phones.get(normalizedPhone).push(owner);
    }
  }

  console.log("Duplicate Emails:");
  for (const [email, list] of emails.entries()) {
    if (list.length > 1) {
      console.log(`- ${email}: ${list.map(o => o.id).join(", ")}`);
    }
  }

  console.log("\nDuplicate Phones:");
  for (const [phone, list] of phones.entries()) {
    if (list.length > 1) {
      console.log(`- ${phone}: ${list.map(o => o.id).join(", ")}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
