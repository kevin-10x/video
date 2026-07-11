import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { HTTPException } from 'hono/http-exception';

const router = new Hono();

function createPrisma(env: Cloudflare.Env) {
  return new PrismaClient({ datasourceUrl: env.DATABASE_URL }).$extends(withAccelerate());
}

const AFRICAN_CATEGORIES = [
  'characters', 'backgrounds', 'clothing', 'accessories', 'music', 'sound_effects', 'all'
] as const;

const AFRICAN_REGIONS = [
  'east_africa', 'west_africa', 'southern_africa', 'north_africa', 'central_africa', 'pan_african'
] as const;

router.get('/library', zValidator('query', z.object({
  category: z.enum(AFRICAN_CATEGORIES).optional().default('all'),
  region: z.enum(AFRICAN_REGIONS).optional(),
  style: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})), async (c) => {
  const { category, region, style, page, limit } = c.req.valid('query');
  const prisma = createPrisma(c.env);
  const user = c.get('user');
  const skip = (page - 1) * limit;

  const where: any = {
    isPublic: true,
    tags: { hasSome: ['african', 'afrotoon'] },
  };

  if (category && category !== 'all') {
    const typeMap: Record<string, string[]> = {
      characters: ['CHARACTER'],
      backgrounds: ['BACKGROUND'],
      clothing: ['CLOTHING'],
      accessories: ['ACCESSORY'],
      music: ['MUSIC'],
      sound_effects: ['SOUND_EFFECT'],
    };
    where.type = { in: typeMap[category] || [] };
  }

  if (region) where.metadata = { path: ['region'], equals: region };

  if (style) where.tags = { hasSome: ['african', 'afrotoon', style.toLowerCase()] };

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      orderBy: { downloadCount: 'desc' },
      skip,
      take: limit,
      select: {
        id: true, name: true, type: true, mimeType: true, size: true, url: true,
        thumbnailUrl: true, width: true, height: true, duration: true,
        tags: true, metadata: true, downloadCount: true, createdAt: true,
      },
    }),
    prisma.asset.count({ where }),
  ]);

  return c.json({ assets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/categories', (c) => {
  return c.json({
    categories: [
      { id: 'characters', name: 'Characters', count: 6, icon: '👤' },
      { id: 'backgrounds', name: 'Backgrounds', count: 8, icon: '🌍' },
      { id: 'clothing', name: 'Clothing', count: 8, icon: '👗' },
      { id: 'accessories', name: 'Accessories', count: 8, icon: '💍' },
      { id: 'music', name: 'Music', count: 8, icon: '🎵' },
      { id: 'sound_effects', name: 'Sound Effects', count: 4, icon: '🔊' },
    ],
    regions: [
      { id: 'east_africa', name: 'East Africa', countries: ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Ethiopia'] },
      { id: 'west_africa', name: 'West Africa', countries: ['Nigeria', 'Ghana', 'Senegal', 'Mali', 'Ivory Coast'] },
      { id: 'southern_africa', name: 'Southern Africa', countries: ['South Africa', 'Zimbabwe', 'Botswana', 'Namibia'] },
      { id: 'north_africa', name: 'North Africa', countries: ['Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya'] },
      { id: 'central_africa', name: 'Central Africa', countries: ['DR Congo', 'Cameroon', 'Gabon', 'Congo'] },
      { id: 'pan_african', name: 'Pan-African', countries: ['All'] },
    ],
    styles: [
      { id: 'AFRICAN_CARTOON', name: 'African Cartoon', description: 'Bold outlines, vibrant colors, cultural patterns' },
      { id: 'MAASAI_STYLE', name: 'Maasai Style', description: 'Red/blue palette, geometric beadwork patterns' },
      { id: 'YORUBA_STYLE', name: 'Yoruba Style', description: 'Earth tones, adire patterns, royal motifs' },
      { id: 'ZULU_STYLE', name: 'Zulu Style', description: 'Black/white contrast, shield patterns' },
      { id: 'KENTE_STYLE', name: 'Kente Style', description: 'Woven geometric patterns, gold/green/red' },
      { id: 'ANKARA_STYLE', name: 'Ankara Style', description: 'Bold wax prints, vibrant florals' },
    ],
  });
});

const PRESET_CHARACTERS = [
  { id: 'maasai_warrior', name: 'Maasai Warrior', region: 'East Africa', culture: 'Maasai', gender: 'male', animations: ['idle', 'walk', 'spear_throw', 'dance'], clothing: ['maasai_shuka'], accessories: ['beaded_jewelry', 'shield'] },
  { id: 'yoruba_elder', name: 'Yoruba Elder', region: 'West Africa', culture: 'Yoruba', gender: 'male', animations: ['idle', 'gesture', 'storytelling', 'blessing'], clothing: ['agbada'], accessories: ['fila_cap', 'wisdom_beads'] },
  { id: 'zulu_dancer', name: 'Zulu Dancer', region: 'Southern Africa', culture: 'Zulu', gender: 'female', animations: ['idle', 'dance', 'shield_dance', 'celebration'], clothing: ['zulu_attire'], accessories: ['ankle_rattles', 'shield'] },
  { id: 'modern_youth', name: 'Modern African Youth', region: 'Pan-African', culture: 'Modern', gender: 'neutral', animations: ['idle', 'walk', 'phone', 'dance', 'celebrate'], clothing: ['modern_afro'], accessories: [] },
  { id: 'griot_storyteller', name: 'Griot Storyteller', region: 'West Africa', culture: 'Mande', gender: 'male', animations: ['idle', 'play_kora', 'storytelling', 'gesture'], clothing: ['boubou'], accessories: ['kora'] },
  { id: 'fulani_herder', name: 'Fulani Herder', region: 'Sahel', culture: 'Fulani', gender: 'male', animations: ['idle', 'walk', 'staff', 'herd'], clothing: ['conical_hat'], accessories: ['walking_stick', 'cattle'] },
];

const PRESET_BACKGROUNDS = [
  { id: 'savanna', name: 'African Savanna', region: 'East Africa', timeOfDay: ['dawn', 'day', 'dusk', 'night'], elements: ['acacia_trees', 'grasslands', 'wildlife_silhouettes'] },
  { id: 'traditional_village', name: 'Traditional Village', region: 'West Africa', timeOfDay: ['dawn', 'day', 'dusk'], elements: ['round_huts', 'communal_fire', 'baobab_tree', 'granaries'] },
  { id: 'bustling_market', name: 'Bustling Market', region: 'West Africa', timeOfDay: ['morning', 'day'], elements: ['fabric_stalls', 'spice_piles', 'fruit_vendors', 'crowds'] },
  { id: 'modern_city', name: 'Modern African City', region: 'Pan-African', timeOfDay: ['day', 'dusk', 'night'], elements: ['skyscrapers', 'traffic', 'billboards', 'pedestrians'] },
  { id: 'rainforest', name: 'Tropical Rainforest', region: 'Central Africa', timeOfDay: ['dawn', 'day', 'dusk'], elements: ['dense_canopy', 'river', 'exotic_birds', 'butterflies'] },
  { id: 'coastal_town', name: 'Coastal Town', region: 'East Africa', timeOfDay: ['dawn', 'day', 'dusk', 'night'], elements: ['fishing_boats', 'white_sand', 'palm_trees', 'dhow_sails'] },
  { id: 'desert_oasis', name: 'Desert Oasis', region: 'North Africa', timeOfDay: ['dawn', 'day', 'dusk', 'night'], elements: ['sand_dunes', 'palm_grove', 'starry_sky', 'camels'] },
  { id: 'mountain_highlands', name: 'Mountain Highlands', region: 'East Africa', timeOfDay: ['dawn', 'day', 'dusk'], elements: ['terraced_farms', 'misty_peaks', 'cool_climate', 'tea_plantations'] },
];

const PRESET_CLOTHING = [
  { id: 'maasai_shuka', name: 'Maasai Shuka', category: 'traditional', variations: ['red_blue', 'red_black', 'purple_blue'] },
  { id: 'ankara_dress', name: 'Ankara Dress', category: 'modern', variations: ['bold_floral', 'geometric', 'abstract'] },
  { id: 'dashiki', name: 'Dashiki', category: 'traditional', variations: ['embroidered', 'plain', 'modern_cut'] },
  { id: 'kente_cloth', name: 'Kente Cloth Wrap', category: 'ceremonial', variations: ['traditional', 'modern_tailored'] },
  { id: 'boubou', name: 'Grand Boubou', category: 'formal', variations: ['embroidered', 'plain'] },
  { id: 'modern_afro', name: 'Modern Afro Streetwear', category: 'contemporary', variations: ['hoodie', 't_shirt', 'jacket', 'sneakers'] },
  { id: 'zulu_attire', name: 'Zulu Traditional', category: 'traditional', variations: ['ceremonial', 'dance'] },
  { id: 'wax_print_suit', name: 'Wax Print Suit', category: 'formal', variations: ['two_piece', 'three_piece'] },
];

const PRESET_ACCESSORIES = [
  { id: 'beaded_jewelry', name: 'Beaded Jewelry', category: 'jewelry' },
  { id: 'headwrap', name: 'Headwrap (Gele)', category: 'headwear' },
  { id: 'walking_stick', name: 'Carved Walking Stick', category: 'props' },
  { id: 'djembe', name: 'Djembe Drum', category: 'instruments' },
  { id: 'kora', name: 'Kora Harp', category: 'instruments' },
  { id: 'cowrie_shells', name: 'Cowrie Shell Necklace', category: 'jewelry' },
  { id: 'nguni_shield', name: 'Nguni Shield', category: 'props' },
  { id: 'fly_whisk', name: 'Fly Whisk', category: 'props' },
];

const PRESET_MUSIC = [
  { id: 'afrobeat', name: 'Afrobeat', genre: 'Afrobeat', bpm: 110, key: 'F_minor', duration: 30, loopable: true, region: 'Nigeria' },
  { id: 'highlife', name: 'Highlife', genre: 'Highlife', bpm: 96, key: 'C_major', duration: 45, loopable: true, region: 'Ghana/Nigeria' },
  { id: 'amapiano', name: 'Amapiano', genre: 'Amapiano', bpm: 115, key: 'G_minor', duration: 30, loopable: true, region: 'South Africa' },
  { id: 'traditional_drums', name: 'Traditional Drums', genre: 'Traditional', bpm: 120, key: 'N/A', duration: 60, loopable: true, region: 'West Africa' },
  { id: 'mbira', name: 'Mbira/Kalimba', genre: 'Traditional', bpm: 80, key: 'G_major', duration: 40, loopable: true, region: 'Zimbabwe' },
  { id: 'benga', name: 'Benga', genre: 'Benga', bpm: 130, key: 'D_major', duration: 30, loopable: true, region: 'Kenya' },
  { id: 'mbalax', name: 'Mbalax', genre: 'Mbalax', bpm: 125, key: 'A_minor', duration: 30, loopable: true, region: 'Senegal' },
  { id: 'kwaito', name: 'Kwaito', genre: 'Kwaito', bpm: 110, key: 'E_minor', duration: 45, loopable: true, region: 'South Africa' },
];

const PRESET_SOUND_EFFECTS = [
  { id: 'market_ambience', name: 'Market Ambience', category: 'ambience', duration: 60, loopable: true, region: 'West Africa' },
  { id: 'savanna_wildlife', name: 'Savanna Wildlife', category: 'nature', duration: 60, loopable: true, region: 'East Africa' },
  { id: 'rainforest_rain', name: 'Rainforest Rain', category: 'weather', duration: 60, loopable: true, region: 'Central Africa' },
  { id: 'drum_circle', name: 'Drum Circle', category: 'music', duration: 30, loopable: true, region: 'Pan-African' },
];

router.get('/presets', (c) => {
  return c.json({
    characters: PRESET_CHARACTERS,
    backgrounds: PRESET_BACKGROUNDS,
    clothing: PRESET_CLOTHING,
    accessories: PRESET_ACCESSORIES,
    music: PRESET_MUSIC,
    soundEffects: PRESET_SOUND_EFFECTS,
  });
});

router.get('/character/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
  const character = PRESET_CHARACTERS.find(c => c.id === c.req.valid('param').id);
  if (!character) throw new HTTPException(404, { message: 'Character not found' });
  return c.json({ character });
});

router.get('/background/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
  const background = PRESET_BACKGROUNDS.find(b => b.id === c.req.valid('param').id);
  if (!background) throw new HTTPException(404, { message: 'Background not found' });
  return c.json({ background });
});

router.get('/clothing/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
  const clothing = PRESET_CLOTHING.find(c => c.id === c.req.valid('param').id);
  if (!clothing) throw new HTTPException(404, { message: 'Clothing not found' });
  return c.json({ clothing });
});

router.get('/music/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
  const music = PRESET_MUSIC.find(m => m.id === c.req.valid('param').id);
  if (!music) throw new HTTPException(404, { message: 'Music not found' });
  return c.json({ music });
});

router.post('/generate-scene', zValidator('json', z.object({
  characterId: z.string(),
  backgroundId: z.string(),
  clothingIds: z.array(z.string()).optional(),
  accessoryIds: z.array(z.string()).optional(),
  musicId: z.string().optional(),
  prompt: z.string().optional(),
  style: z.string().default('AFRICAN_CARTOON'),
  duration: z.number().min(3).max(60).default(5),
  fps: z.number().int().min(1).max(60).default(30),
})), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  const character = PRESET_CHARACTERS.find(c => c.id === data.characterId);
  const background = PRESET_BACKGROUNDS.find(b => b.id === data.backgroundId);
  
  if (!character || !background) throw new HTTPException(400, { message: 'Invalid character or background' });

  const scene = {
    character,
    background,
    clothing: data.clothingIds?.map(id => PRESET_CLOTHING.find(c => c.id === id)).filter(Boolean) || [],
    accessories: data.accessoryIds?.map(id => PRESET_ACCESSORIES.find(a => a.id === id)).filter(Boolean) || [],
    music: data.musicId ? PRESET_MUSIC.find(m => m.id === data.musicId) : null,
    style: data.style,
    duration: data.duration,
    fps: data.fps,
    prompt: data.prompt,
  };

  const jobId = crypto.randomUUID();
  await c.env.JOB_QUEUE.send({
    type: 'AFRICAN_CARTOON_GENERATOR',
    jobId,
    userId: user.id,
    input: scene,
    priority: 10,
  });

  return c.json({ jobId, message: 'Scene generation queued', scene });
});

export default router;