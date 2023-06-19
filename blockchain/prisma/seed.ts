import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

async function main() {
  const originBlock = await prisma.block.upsert({
    where: { index: 1 },
    update: {},
    create: { index: 1, timestamp: new Date(), transactions: [], rootHash: "0", nonce: 100, hash: "0", previousBlockHash: "0" }
  })
}
main()
  .then(async () => {
    console.log("Origin block created successfully")
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })