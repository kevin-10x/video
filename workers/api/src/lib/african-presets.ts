export const PRESET_CHARACTERS = [
  { id: 'maasai_warrior', name: 'Maasai Warrior', region: 'East Africa', culture: 'Maasai', gender: 'male', icon: '🏕️', description: 'Traditional red shuka, spear, beaded jewelry', animations: ['idle', 'walk', 'spear_throw', 'dance', 'gesture'], tags: ['maasai', 'east-africa', 'warrior', 'traditional'] },
  { id: 'yoruba_elder', name: 'Yoruba Elder', region: 'West Africa', culture: 'Yoruba', gender: 'male', icon: '👑', description: 'Agbada robe, fila cap, wisdom beads', animations: ['idle', 'gesture', 'storytelling', 'blessing', 'sit'], tags: ['yoruba', 'west-africa', 'elder', 'royal'] },
  { id: 'zulu_dancer', name: 'Zulu Dancer', region: 'Southern Africa', culture: 'Zulu', gender: 'female', icon: '🛡️', description: 'Animal skin skirt, shield, ankle rattles', animations: ['idle', 'dance', 'shield_dance', 'celebration', 'war_cry'], tags: ['zulu', 'southern-africa', 'dancer', 'warrior'] },
  { id: 'modern_youth', name: 'Modern African Youth', region: 'Pan-African', culture: 'Modern', gender: 'neutral', icon: '📱', description: 'Contemporary streetwear, afro hair', animations: ['idle', 'walk', 'phone', 'dance', 'celebrate', 'selfie'], tags: ['modern', 'pan-african', 'youth', 'contemporary'] },
  { id: 'griot_storyteller', name: 'Griot Storyteller', region: 'West Africa', culture: 'Mande', gender: 'male', icon: '📜', description: 'Kora instrument, traditional robes', animations: ['idle', 'play_kora', 'storytelling', 'gesture', 'sing'], tags: ['griot', 'west-africa', 'storyteller', 'musician'] },
  { id: 'fulani_herder', name: 'Fulani Herder', region: 'Sahel', culture: 'Fulani', gender: 'male', icon: '🐄', description: 'Conical hat, walking stick, cattle', animations: ['idle', 'walk', 'herd_cattle', 'play_flute', 'rest'], tags: ['fulani', 'sahel', 'herder', 'nomadic'] },
];

export const PRESET_BACKGROUNDS = [
  { id: 'savanna', name: 'African Savanna', region: 'East Africa', icon: '🌾', description: 'Acacia trees, golden grasslands, wildlife silhouettes', timeOfDay: ['dawn', 'day', 'dusk', 'night'], elements: ['acacia_trees', 'grasslands', 'wildlife_silhouettes', 'dust_dancing'], tags: ['savanna', 'east-africa', 'wildlife', 'acacia'] },
  { id: 'traditional_village', name: 'Traditional Village', region: 'West Africa', icon: '🏘️', description: 'Round huts, communal fire, baobab tree', timeOfDay: ['dawn', 'day', 'dusk'], elements: ['round_huts', 'communal_fire', 'baobab_tree', 'granaries', 'children_playing'], tags: ['village', 'west-africa', 'huts', 'community'] },
  { id: 'bustling_market', name: 'Bustling Market', region: 'West Africa', icon: '🛍️', description: 'Colorful stalls, fabrics, spices, crowds', timeOfDay: ['morning', 'day'], elements: ['fabric_stalls', 'spice_piles', 'fruit_vendors', 'crowds', 'bargaining'], tags: ['market', 'west-africa', 'colorful', 'commerce'] },
  { id: 'modern_city', name: 'Modern African City', region: 'Pan-African', icon: '🏙️', description: 'Skyscrapers, busy streets, technology', timeOfDay: ['day', 'dusk', 'night'], elements: ['skyscrapers', 'traffic', 'billboards', 'pedestrians', 'mobile_money_agents'], tags: ['city', 'modern', 'skyscrapers', 'urban'] },
  { id: 'rainforest', name: 'Tropical Rainforest', region: 'Central Africa', icon: '🌿', description: 'Dense canopy, rivers, exotic birds', timeOfDay: ['dawn', 'day', 'dusk'], elements: ['dense_canopy', 'river', 'exotic_birds', 'butterflies', 'mist'], tags: ['rainforest', 'central-africa', 'nature', 'dense'] },
  { id: 'coastal_town', name: 'Coastal Town', region: 'East Africa', icon: '🏖️', description: 'Fishing boats, white sand, palm trees', timeOfDay: ['dawn', 'day', 'dusk', 'night'], elements: ['fishing_boats', 'white_sand', 'palm_trees', 'dhow_sails', 'coconut_vendors'], tags: ['coastal', 'east-africa', 'beach', 'fishing'] },
  { id: 'desert_oasis', name: 'Desert Oasis', region: 'North Africa', icon: '🏜️', description: 'Sand dunes, palm grove, starry night', timeOfDay: ['dawn', 'day', 'dusk', 'night'], elements: ['sand_dunes', 'palm_grove', 'spring_water', 'camels', 'starry_sky'], tags: ['desert', 'north-africa', 'oasis', 'dunes'] },
  { id: 'mountain_highlands', name: 'Mountain Highlands', region: 'East Africa', icon: '⛰️', description: 'Terraced farms, misty peaks, cool climate', timeOfDay: ['dawn', 'day', 'dusk'], elements: ['terraced_farms', 'misty_peaks', 'tea_plantations', 'cool_climate', 'clouds'], tags: ['mountain', 'east-africa', 'highlands', 'terraced'] },
];

export const PRESET_CLOTHING = [
  { id: 'maasai_shuka', name: 'Maasai Shuka', icon: '🧣', category: 'traditional', region: 'East Africa', culture: 'Maasai', gender: 'unisex', variations: ['red_blue', 'red_black', 'purple_blue'], tags: ['maasai', 'shuka', 'checkered', 'traditional'] },
  { id: 'ankara_dress', name: 'Ankara Dress', icon: '👗', category: 'modern', region: 'West Africa', culture: 'Yoruba/Igbo', gender: 'female', variations: ['bold_floral', 'geometric', 'abstract'], tags: ['ankara', 'wax_print', 'dress', 'women'] },
  { id: 'dashiki', name: 'Dashiki', icon: '👘', category: 'traditional', region: 'West Africa', culture: 'Pan-African', gender: 'male', variations: ['embroidered', 'plain', 'modern_cut'], tags: ['dashiki', 'tunic', 'men', 'traditional'] },
  { id: 'kente_cloth', name: 'Kente Cloth Wrap', icon: '🎨', category: 'ceremonial', region: 'Ghana', culture: 'Ashanti/Ewe', gender: 'unisex', variations: ['traditional', 'modern_tailored'], tags: ['kente', 'ghana', 'woven', 'ceremonial'] },
  { id: 'boubou', name: 'Grand Boubou', icon: '👔', category: 'formal', region: 'West Africa', culture: 'Pan-African', gender: 'male', variations: ['embroidered', 'plain', 'modern'], tags: ['boubou', 'formal', 'flowing_robe'] },
  { id: 'modern_afro', name: 'Modern Afro Streetwear', icon: '🧢', category: 'contemporary', region: 'Pan-African', culture: 'Urban', gender: 'unisex', variations: ['hoodie', 't_shirt', 'jacket', 'sneakers'], tags: ['streetwear', 'modern', 'youth', 'urban'] },
  { id: 'zulu_attire', name: 'Zulu Traditional', icon: '🛡️', category: 'traditional', region: 'Southern Africa', culture: 'Zulu', gender: 'female', variations: ['beaded_skirt', 'married_woman', 'maiden'], tags: ['zulu', 'traditional', 'beadwork'] },
  { id: 'wax_print_suit', name: 'Wax Print Suit', icon: '🤵', category: 'formal', region: 'West Africa', culture: 'Modern', gender: 'male', variations: ['slim_fit', 'traditional_cut', 'agbada_style'], tags: ['wax_print', 'suit', 'formal', 'modern'] },
];

export const PRESET_ACCESSORIES = [
  { id: 'beaded_jewelry', name: 'Beaded Jewelry', icon: '💍', category: 'jewelry', tags: ['beads', 'necklace', 'bracelet', 'earrings'] },
  { id: 'headwrap', name: 'Headwrap (Gele)', icon: '👒', category: 'headwear', tags: ['gele', 'headwrap', 'women', 'ceremonial'] },
  { id: 'walking_stick', name: 'Carved Walking Stick', icon: '🦯', category: 'props', tags: ['walking_stick', 'carved', 'elder', 'status'] },
  { id: 'african_drum', name: 'Djembe Drum', icon: '🥁', category: 'instruments', tags: ['djembe', 'drum', 'percussion', 'west_africa'] },
  { id: 'kora', name: 'Kora Harp', icon: '🪕', category: 'instruments', tags: ['kora', 'harp', 'griot', 'west_africa'] },
  { id: 'cowrie_shells', name: 'Cowrie Shell Necklace', icon: '🐚', category: 'jewelry', tags: ['cowrie', 'shells', 'necklace', 'traditional'] },
  { id: 'shield', name: 'Nguni Shield', icon: '🛡️', category: 'props', tags: ['shield', 'nguni', 'zulu', 'warrior'] },
  { id: 'fly_whisk', name: 'Fly Whisk', icon: '🪶', category: 'props', tags: ['fly_whisk', 'royal', 'status', 'elder'] },
];

export const PRESET_MUSIC = [
  { id: 'afrobeat', name: 'Afrobeat', icon: '🎵', genre: 'Afrobeat', bpm: 110, key: 'F_minor', duration: 30, loopable: true, description: 'Fela Kuti style, horns, complex rhythms', region: 'Nigeria', tags: ['afrobeat', 'fela', 'horns', 'complex'] },
  { id: 'highlife', name: 'Highlife', icon: '🎷', genre: 'Highlife', bpm: 96, key: 'C_major', duration: 45, loopable: true, description: 'Ghanaian/Nigerian guitar, jazzy', region: 'Ghana/Nigeria', tags: ['highlife', 'guitar', 'jazz', 'ghana'] },
  { id: 'amapiano', name: 'Amapiano', icon: '🎹', genre: 'Amapiano', bpm: 115, key: 'G_minor', duration: 30, loopable: true, description: 'South African house, log drums', region: 'South Africa', tags: ['amapiano', 'house', 'log_drums', 'south_africa'] },
  { id: 'kwaito', name: 'Kwaito', icon: '🎤', genre: 'Kwaito', bpm: 110, key: 'E_minor', duration: 45, loopable: true, description: 'Slow tempo, township vibes', region: 'South Africa', tags: ['kwaito', 'township', 'slow', 'south_africa'] },
  { id: 'traditional_drums', name: 'Traditional Drums', icon: '🥁', genre: 'Traditional', bpm: 120, key: 'N/A', duration: 60, loopable: true, description: 'Talking drums, djembe, dunun', region: 'West Africa', tags: ['drums', 'talking_drum', 'djembe', 'dunun'] },
  { id: 'mbira', name: 'Mbira/Kalimba', icon: '🎶', genre: 'Traditional', bpm: 80, key: 'G_major', duration: 40, loopable: true, description: 'Thumb piano, spiritual melodies', region: 'Zimbabwe', tags: ['mbira', 'kalimba', 'thumb_piano', 'spiritual'] },
  { id: 'benga', name: 'Benga', icon: '🎸', genre: 'Benga', bpm: 130, key: 'D_major', duration: 30, loopable: true, description: 'Kenyan fast guitar, Luo rhythms', region: 'Kenya', tags: ['benga', 'guitar', 'kenya', 'luo'] },
  { id: 'mbalax', name: 'Mbalax', icon: '🥁', genre: 'Mbalax', bpm: 125, key: 'A_minor', duration: 30, loopable: true, description: 'Senegalese sabar drums, modern pop', region: 'Senegal', tags: ['mbalax', 'sabar', 'senegal', 'youssou_ndour'] },
];

export const PRESET_SOUND_EFFECTS = [
  { id: 'market_ambience', name: 'Market Ambience', category: 'ambience', duration: 60, loopable: true, region: 'West Africa', description: 'Crowd chatter, vendors calling, footsteps' },
  { id: 'savanna_wildlife', name: 'Savanna Wildlife', category: 'nature', duration: 60, loopable: true, region: 'East Africa', description: 'Birds, distant lions, insects, wind' },
  { id: 'rainforest_rain', name: 'Rainforest Rain', category: 'weather', duration: 60, loopable: true, region: 'Central Africa', description: 'Heavy rain, thunder, dripping water' },
  { id: 'drum_circle', name: 'Drum Circle', category: 'music', duration: 30, loopable: true, region: 'Pan-African', description: 'Multiple drums, rhythmic chanting' },
];