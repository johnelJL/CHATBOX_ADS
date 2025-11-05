import { ListingStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'demo@classifai.example' },
    update: {},
    create: {
      id: 'placeholder-user',
      email: 'demo@classifai.example',
      name: 'Demo Seller'
    }
  });

  const demoUser = await prisma.user.findUniqueOrThrow({ where: { id: 'placeholder-user' } });

  await prisma.listing.deleteMany();

  const demoListings = Array.from({ length: 20 }).map((_, index) => ({
    title: `201${index % 10} Demo Car ${index + 1}`,
    description:
      'Well-maintained demo vehicle with AI-generated description. Includes safety checks and transparent history.',
    price: 10000 + index * 500,
    currency: 'EUR',
    locationRegion: 'Attica',
    locationCity: 'Athens',
    make: 'DemoMake',
    model: `Model ${index + 1}`,
    year: 2010 + (index % 10),
    mileageKm: 50000 + index * 4000,
    photosCount: 1,
    userId: demoUser.id,
    status: ListingStatus.active,
    images: {
      create: [
        {
          url: `https://picsum.photos/seed/demo-${index}/800/600`,
          width: 800,
          height: 600,
          blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
          order: 0
        }
      ]
    }
  }));

  for (const listing of demoListings) {
    await prisma.listing.create({ data: listing });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
