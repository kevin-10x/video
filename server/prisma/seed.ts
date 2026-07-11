import { PrismaClient, UserRole, AssetType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@adamae.com' },
    update: {},
    create: {
      email: 'admin@adamae.com',
      name: 'Admin User',
      username: 'admin',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      credits: 10000,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 12);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@adamae.com' },
    update: {},
    create: {
      email: 'demo@adamae.com',
      name: 'Demo User',
      username: 'demo',
      passwordHash: demoPassword,
      emailVerified: new Date(),
      credits: 500,
    },
  });
  console.log('✅ Demo user created:', demo.email);

  // Create system configs
  await prisma.systemConfig.upsert({
    where: { key: 'african_styles' },
    update: {},
    create: {
      key: 'african_styles',
      value: [
        { id: 'MAASAI_STYLE', name: 'Maasai Style', region: 'East Africa', colors: ['#C0392B', '#2980B9', '#FFFFFF'], patterns: ['geometric_beadwork', 'checkered_shuka'] },
        { id: 'YORUBA_STYLE', name: 'Yoruba Style', region: 'West Africa', colors: ['#8B4513', '#DAA520', '#FFD700'], patterns: ['adire_indigo', 'royal_motifs'] },
        { id: 'ZULU_STYLE', name: 'Zulu Style', region: 'Southern Africa', colors: ['#000000', '#FFFFFF', '#FF0000'], patterns: ['shield_patterns', 'beadwork'] },
        { id: 'KENTE_STYLE', name: 'Kente Style', region: 'Ghana', colors: ['#FFD700', '#006400', '#DC143C'], patterns: ['woven_geometric', 'strip_weaving'] },
        { id: 'ANKARA_STYLE', name: 'Ankara Style', region: 'West Africa', colors: ['#FF6B35', '#F7DC6F', '#2ECC71'], patterns: ['wax_prints', 'bold_florals'] },
        { id: 'AFRICAN_CARTOON', name: 'African Cartoon', region: 'Pan-African', colors: ['#E67E22', '#27AE60', '#2980B9', '#E74C3C'], patterns: ['cultural_fusion', 'vibrant_outlines'] },
      ],
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'animation_styles' },
    update: {},
    create: {
      key: 'animation_styles',
      value: [
        { id: 'ANIME', name: 'Anime', description: 'Japanese animation style', previewUrl: null },
        { id: 'COMIC', name: 'Comic Book', description: 'Bold lines, halftone effects', previewUrl: null },
        { id: 'PIXAR_STYLE', name: 'Pixar Style', description: '3D animated movie look', previewUrl: null },
        { id: 'DISNEY_STYLE', name: 'Disney Style', description: 'Classic Disney animation', previewUrl: null },
        { id: 'AFRICAN_CARTOON', name: 'African Cartoon', description: 'Authentic African art style', previewUrl: null },
        { id: 'MANGA', name: 'Manga', description: 'Black & white manga style', previewUrl: null },
        { id: 'CHIBI', name: 'Chibi', description: 'Cute super-deformed style', previewUrl: null },
        { id: 'GHIBLI_STYLE', name: 'Ghibli Style', description: 'Studio Ghibli aesthetic', previewUrl: null },
        { id: 'WATERCOLOR', name: 'Watercolor', description: 'Soft painted look', previewUrl: null },
        { id: 'OIL_PAINTING', name: 'Oil Painting', description: 'Textured artistic style', previewUrl: null },
        { id: 'PENCIL_SKETCH', name: 'Pencil Sketch', description: 'Hand-drawn sketch effect', previewUrl: null },
        { id: 'CLAYMATION', name: 'Claymation', description: 'Stop-motion clay look', previewUrl: null },
      ],
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'credit_costs' },
    update: {},
    create: {
      key: 'credit_costs',
      value: {
        VIDEO_TO_CARTOON_BASE: 15,
        TEXT_TO_CARTOON_BASE: 10,
        IMAGE_TO_CARTOON_BASE: 5,
        STYLE_AFRICAN_CARTOON: 5,
        STYLE_PREMIUM: 8,
        QUALITY_1080P: 5,
        QUALITY_2K: 10,
        QUALITY_4K: 20,
        LIP_SYNC: 10,
        SUBTITLES: 3,
        BACKGROUND_REPLACE: 8,
        AUDIO_ENHANCE: 3,
        UPSCALE: 5,
      },
    },
  });

  // Seed African asset library (metadata only - files uploaded separately)
  const africanAssets = [
    // Characters
    { name: 'Maasai Warrior', type: AssetType.CHARACTER, tags: ['maasai', 'east-africa', 'warrior', 'traditional'], metadata: { region: 'East Africa', culture: 'Maasai', gender: 'male', animations: ['idle', 'walk', 'spear_throw', 'dance'] } },
    { name: 'Yoruba Elder', type: AssetType.CHARACTER, tags: ['yoruba', 'west-africa', 'elder', 'royal'], metadata: { region: 'West Africa', culture: 'Yoruba', gender: 'male', animations: ['idle', 'gesture', 'storytelling', 'blessing'] } },
    { name: 'Zulu Dancer', type: AssetType.CHARACTER, tags: ['zulu', 'southern-africa', 'dancer', 'warrior'], metadata: { region: 'Southern Africa', culture: 'Zulu', gender: 'female', animations: ['idle', 'dance', 'shield_dance', 'celebration'] } },
    { name: 'Modern African Youth', type: AssetType.CHARACTER, tags: ['modern', 'pan-african', 'youth', 'contemporary'], metadata: { region: 'Pan-African', culture: 'Modern', gender: 'neutral', animations: ['idle', 'walk', 'phone', 'dance', 'celebrate'] } },
    { name: 'Griot Storyteller', type: AssetType.CHARACTER, tags: ['griot', 'west-africa', 'storyteller', 'musician'], metadata: { region: 'West Africa', culture: 'Mande', gender: 'male', animations: ['idle', 'play_kora', 'storytelling', 'gesture'] } },

    // Backgrounds
    { name: 'African Savanna', type: AssetType.BACKGROUND, tags: ['savanna', 'east-africa', 'wildlife', 'acacia'], metadata: { region: 'East Africa', timeOfDay: ['dawn', 'day', 'dusk', 'night'], elements: ['acacia_trees', 'grasslands', 'wildlife_silhouettes'] } },
    { name: 'Traditional Village', type: AssetType.BACKGROUND, tags: ['village', 'west-africa', 'huts', 'community'], metadata: { region: 'West Africa', timeOfDay: ['dawn', 'day', 'dusk'], elements: ['round_huts', 'communal_fire', 'baobab_tree', 'granaries'] } },
    { name: 'Bustling Market', type: AssetType.BACKGROUND, tags: ['market', 'west-africa', 'colorful', 'commerce'], metadata: { region: 'West Africa', timeOfDay: ['morning', 'day'], elements: ['fabric_stalls', 'spice_piles', 'fruit_vendors', 'crowds'] } },
    { name: 'Modern African City', type: AssetType.BACKGROUND, tags: ['city', 'modern', 'skyscrapers', 'urban'], metadata: { region: 'Pan-African', timeOfDay: ['day', 'dusk', 'night'], elements: ['skyscrapers', 'traffic', 'billboards', 'pedestrians'] } },
    { name: 'Tropical Rainforest', type: AssetType.BACKGROUND, tags: ['rainforest', 'central-africa', 'nature', 'dense'], metadata: { region: 'Central Africa', timeOfDay: ['dawn', 'day', 'dusk'], elements: ['dense_canopy', 'river', 'exotic_birds', 'butterflies'] } },

    // Clothing
    { name: 'Maasai Shuka', type: AssetType.CLOTHING, tags: ['maasai', 'shuka', 'checkered', 'traditional'], metadata: { region: 'East Africa', culture: 'Maasai', gender: 'unisex', variations: ['red_blue', 'red_black', 'purple_blue'] } },
    { name: 'Ankara Dress', type: AssetType.CLOTHING, tags: ['ankara', 'wax_print', 'dress', 'women'], metadata: { region: 'West Africa', culture: 'Yoruba/Igbo', gender: 'female', variations: ['bold_floral', 'geometric', 'abstract'] } },
    { name: 'Dashiki', type: AssetType.CLOTHING, tags: ['dashiki', 'tunic', 'men', 'traditional'], metadata: { region: 'West Africa', culture: 'Pan-African', gender: 'male', variations: ['embroidered', 'plain', 'modern_cut'] } },
    { name: 'Kente Cloth Wrap', type: AssetType.CLOTHING, tags: ['kente', 'ghana', 'woven', 'ceremonial'], metadata: { region: 'Ghana', culture: 'Ashanti/Ewe', gender: 'unisex', variations: ['traditional', 'modern_tailored'] } },
    { name: 'Modern Afro Streetwear', type: AssetType.CLOTHING, tags: ['streetwear', 'modern', 'youth', 'contemporary'], metadata: { region: 'Pan-African', culture: 'Urban', gender: 'unisex', variations: ['hoodie', 't_shirt', 'jacket', 'sneakers'] } },

    // Music
    { name: 'Afrobeat Loop', type: AssetType.MUSIC, tags: ['afrobeat', 'fela_kuti', 'horns', 'percussion'], metadata: { genre: 'Afrobeat', bpm: 110, key: 'F_minor', duration: 30, loopable: true, region: 'Nigeria' } },
    { name: 'Highlife Guitar', type: AssetType.MUSIC, tags: ['highlife', 'guitar', 'ghana', 'nigeria'], metadata: { genre: 'Highlife', bpm: 96, key: 'C_major', duration: 45, loopable: true, region: 'Ghana/Nigeria' } },
    { name: 'Amapiano Log Drum', type: AssetType.MUSIC, tags: ['amapiano', 'south-africa', 'log_drum', 'house'], metadata: { genre: 'Amapiano', bpm: 115, key: 'G_minor', duration: 30, loopable: true, region: 'South Africa' } },
    { name: 'Traditional Drums', type: AssetType.MUSIC, tags: ['drums', 'talking_drum', 'djembe', 'dunun'], metadata: { genre: 'Traditional', bpm: 120, key: 'N/A', duration: 60, loopable: true, region: 'West Africa' } },
    { name: 'Mbira Melody', type: AssetType.MUSIC, tags: ['mbira', 'kalimba', 'zimbabwe', 'spiritual'], metadata: { genre: 'Traditional', bpm: 80, key: 'G_major', duration: 40, loopable: true, region: 'Zimbabwe' } },

    // Sound Effects
    { name: 'Market Ambience', type: AssetType.SOUND_EFFECT, tags: ['market', 'crowd', 'ambience', 'west-africa'], metadata: { duration: 60, loopable: true, region: 'West Africa' } },
    { name: 'Savanna Wildlife', type: AssetType.SOUND_EFFECT, tags: ['savanna', 'birds', 'lions', 'nature'], metadata: { duration: 60, loopable: true, region: 'East Africa' } },
    { name: 'Rainforest Rain', type: AssetType.SOUND_EFFECT, tags: ['rainforest', 'rain', 'thunder', 'nature'], metadata: { duration: 60, loopable: true, region: 'Central Africa' } },
  ];

  for (const asset of africanAssets) {
    await prisma.asset.upsert({
      where: { 
        id: `seed-${asset.name.toLowerCase().replace(/\s+/g, '-')}` 
      },
      update: {},
      create: {
        id: `seed-${asset.name.toLowerCase().replace(/\s+/g, '-')}`,
        userId: admin.id,
        name: asset.name,
        type: asset.type,
        mimeType: asset.type === AssetType.MUSIC || asset.type === AssetType.SOUND_EFFECT ? 'audio/mp3' : 'image/png',
        size: 0,
        url: `/assets/african/${asset.name.toLowerCase().replace(/\s+/g, '-')}.${asset.type === AssetType.MUSIC || asset.type === AssetType.SOUND_EFFECT ? 'mp3' : 'png'}`,
        tags: [...asset.tags, 'african', 'afrotoon', 'library'],
        isPublic: true,
        metadata: asset.metadata,
      },
    });
  }
  console.log('✅ African asset library seeded');

  // Create default user preferences for demo user
  await prisma.userPreference.upsert({
    where: { userId: demo.id },
    update: {},
    create: {
      userId: demo.id,
      theme: 'system',
      language: 'en',
      defaultStyle: 'AFRICAN_CARTOON',
      defaultQuality: 'MEDIUM_720P',
      autoSave: true,
      notifications: {
        jobCompleted: true,
        jobFailed: true,
        exportReady: true,
        creditLow: true,
        weeklyDigest: false,
      },
    },
  });

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });