'use client';

import { useState } from 'react';
import { Sparkles, User, MapPin, Shirt, Gem, Music, Video, Loader2, Palette, Layers, Smile, Heart, Sun, Trees, Building2, Drum, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

const characters = [
  { id: 'maasai_warrior', name: 'Maasai Warrior', region: 'East Africa', icon: '🏕️', description: 'Traditional red shuka, spear, beaded jewelry' },
  { id: 'yoruba_elder', name: 'Yoruba Elder', region: 'West Africa', icon: '👑', description: 'Agbada robe, fila cap, wisdom beads' },
  { id: 'zulu_dancer', name: 'Zulu Dancer', region: 'Southern Africa', icon: '🛡️', description: 'Animal skin skirt, shield, ankle rattles' },
  { id: 'modern_youth', name: 'Modern African Youth', region: 'Pan-African', icon: '📱', description: 'Contemporary streetwear, afro hair' },
  { id: 'griot_storyteller', name: 'Griot Storyteller', region: 'West Africa', icon: '📜', description: 'Kora instrument, traditional robes' },
  { id: 'fulani_herder', name: 'Fulani Herder', region: 'Sahel', icon: '🐄', description: 'Conical hat, walking stick, cattle' },
];

const backgrounds = [
  { id: 'savanna', name: 'African Savanna', icon: '🌾', description: 'Acacia trees, golden grasslands, wildlife' },
  { id: 'traditional_village', name: 'Traditional Village', icon: '🏘️', description: 'Round huts, communal fire, baobab tree' },
  { id: 'bustling_market', name: 'Bustling Market', icon: '🛍️', description: 'Colorful stalls, fabrics, spices, crowds' },
  { id: 'modern_city', name: 'Modern African City', icon: '🏙️', description: 'Skyscrapers, busy streets, technology' },
  { id: 'rainforest', name: 'Tropical Rainforest', icon: '🌿', description: 'Dense canopy, rivers, exotic birds' },
  { id: 'coastal_town', name: 'Coastal Town', icon: '🏖️', description: 'Fishing boats, white sand, palm trees' },
  { id: 'desert_oasis', name: 'Desert Oasis', icon: '🏜️', description: 'Sand dunes, palm grove, starry night' },
  { id: 'mountain_highlands', name: 'Mountain Highlands', icon: '⛰️', description: 'Terraced farms, misty peaks, cool climate' },
];

const clothing = [
  { id: 'maasai_shuka', name: 'Maasai Shuka', icon: '🧣', category: 'traditional' },
  { id: 'ankara_dress', name: 'Ankara Dress', icon: '👗', category: 'modern' },
  { id: 'dashiki', name: 'Dashiki', icon: '👘', category: 'traditional' },
  { id: 'kente_cloth', name: 'Kente Cloth Wrap', icon: '🎨', category: 'ceremonial' },
  { id: 'boubou', name: 'Grand Boubou', icon: '👔', category: 'formal' },
  { id: 'modern_afro', name: 'Modern Afro Streetwear', icon: '🧢', category: 'contemporary' },
  { id: 'zulu_attire', name: 'Zulu Traditional', icon: '🛡️', category: 'traditional' },
  { id: 'wax_print', name: 'Wax Print Suit', icon: '🤵', category: 'formal' },
];

const accessories = [
  { id: 'beaded_jewelry', name: 'Beaded Jewelry', icon: '💍', category: 'jewelry' },
  { id: 'headwrap', name: 'Headwrap (Gele)', icon: '👒', category: 'headwear' },
  { id: 'walking_stick', name: 'Carved Walking Stick', icon: '🦯', category: 'props' },
  { id: 'african_drum', name: 'Djembe Drum', icon: '🥁', category: 'instruments' },
  { id: 'kora', name: 'Kora Harp', icon: '🪕', category: 'instruments' },
  { id: 'cowrie_shells', name: 'Cowrie Shell Necklace', icon: '🐚', category: 'jewelry' },
  { id: 'shield', name: 'Nguni Shield', icon: '🛡️', category: 'props' },
  { id: 'fly_whisk', name: 'Fly Whisk', icon: '🪶', category: 'props' },
];

const musicStyles = [
  { id: 'afrobeat', name: 'Afrobeat', icon: '🎵', description: 'Fela Kuti style, horns, complex rhythms' },
  { id: 'highlife', name: 'Highlife', icon: '🎷', description: 'Ghanaian/Nigerian guitar, jazzy' },
  { id: 'amapiano', name: 'Amapiano', icon: '🎹', description: 'South African house, log drums' },
  { id: 'kwaito', name: 'Kwaito', icon: '🎤', description: 'Slow tempo, township vibes' },
  { id: 'traditional_drums', name: 'Traditional Drums', icon: '🥁', description: 'Talking drums, djembe, dunun' },
  { id: 'mbira', name: 'Mbira/Kalimba', icon: '🎶', description: 'Thumb piano, spiritual melodies' },
  { id: 'benga', name: 'Benga', icon: '🎸', description: 'Kenyan fast guitar, Luo rhythms' },
  { id: 'mbalax', name: 'Mbalax', icon: '🥁', description: 'Senegalese sabar drums, modern pop' },
];

const animationStyles = [
  { id: 'AFRICAN_CARTOON', name: 'African Cartoon', icon: '🎨', description: 'Bold outlines, vibrant colors, cultural patterns' },
  { id: 'MAASAI_STYLE', name: 'Maasai Style', icon: '🏕️', description: 'Red/blue palette, geometric beadwork patterns' },
  { id: 'YORUBA_STYLE', name: 'Yoruba Style', icon: '👑', description: 'Rich earth tones, adire patterns, royal motifs' },
  { id: 'ZULU_STYLE', name: 'Zulu Style', icon: '🛡️', description: 'Black/white contrast, shield patterns, warrior aesthetic' },
  { id: 'KENTE_STYLE', name: 'Kente Style', icon: '🎨', description: 'Woven geometric patterns, gold/green/red' },
  { id: 'ANKARA_STYLE', name: 'Ankara Style', icon: '👗', description: 'Bold wax prints, vibrant florals, modern' },
];

export default function AfricanGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('maasai_warrior');
  const [selectedBackground, setSelectedBackground] = useState('savanna');
  const [selectedClothing, setSelectedClothing] = useState<string[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedMusic, setSelectedMusic] = useState('afrobeat');
  const [animationStyle, setAnimationStyle] = useState('AFRICAN_CARTOON');
  const [duration, setDuration] = useState(5);
  const [fps, setFps] = useState(30);
  const [resolution, setResolution] = useState('720p');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedCharacter) {
      alert('Please enter a prompt or select a character');
      return;
    }
    
    setIsGenerating(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 300);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setProgress(100);
      alert('African cartoon generated! Check your Projects dashboard.');
    } catch (error) {
      alert('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      clearInterval(interval);
    }
  };

  const toggleClothing = (id: string) => {
    setSelectedClothing(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleAccessory = (id: string) => {
    setSelectedAccessories(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const estimatedCredits = 20 + 
    (selectedClothing.length * 2) + 
    (selectedAccessories.length * 1) + 
    (duration > 10 ? 10 : 0);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">African Cartoon Generator</h1>
          <p className="text-muted-foreground mt-1">
            Create authentic African animations from text. Design characters, choose settings, and bring African stories to life.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Story Prompt
              </h2>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your African story scene... e.g., 'A young Maasai warrior watches the sunset over the savanna, cattle grazing peacefully in the background, dust dancing in the golden light'"
                rows={4}
                className="mb-4"
              />
              <div className="flex flex-wrap gap-2">
                {[
                  'Sunrise over savanna',
                  'Village celebration',
                  'Market day hustle',
                  'Traditional dance',
                  'Storytelling by fire',
                  'Modern city life'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(prompt ? `${prompt}. ${suggestion}` : suggestion)}
                    className="px-3 py-1 text-xs bg-muted rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Character
                </h3>
                <div className="grid gap-2">
                  {characters.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => setSelectedCharacter(char.id)}
                      className={cn(
                        'p-3 rounded-lg border-2 text-left transition-all',
                        selectedCharacter === char.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-border hover:border-primary-300 dark:hover:border-primary-700'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{char.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{char.name}</p>
                          <p className="text-xs text-muted-foreground">{char.region}</p>
                          <p className="text-xs text-muted-foreground mt-1">{char.description}</p>
                        </div>
                        {selectedCharacter === char.id && (
                          <Sparkles className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Background
                </h3>
                <div className="grid gap-2">
                  {backgrounds.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBackground(bg.id)}
                      className={cn(
                        'p-3 rounded-lg border-2 text-left transition-all',
                        selectedBackground === bg.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-border hover:border-primary-300 dark:hover:border-primary-700'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{bg.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{bg.name}</p>
                          <p className="text-xs text-muted-foreground">{bg.description}</p>
                        </div>
                        {selectedBackground === bg.id && (
                          <Sparkles className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Customization
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Shirt className="w-4 h-4" />
                    Clothing
                  </h4>
                  <div className="grid gap-2">
                    {clothing.map((item) => (
                      <label
                        key={item.id}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all',
                          selectedClothing.includes(item.id)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-border hover:border-primary-300'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedClothing.includes(item.id)}
                          onChange={() => toggleClothing(item.id)}
                          className="w-4 h-4 text-primary-500 rounded border-border"
                        />
                        <span className="text-sm">{item.icon} {item.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Gem className="w-4 h-4" />
                    Accessories
                  </h4>
                  <div className="grid gap-2">
                    {accessories.map((item) => (
                      <label
                        key={item.id}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all',
                          selectedAccessories.includes(item.id)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-border hover:border-primary-300'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAccessories.includes(item.id)}
                          onChange={() => toggleAccessory(item.id)}
                          className="w-4 h-4 text-primary-500 rounded border-border"
                        />
                        <span className="text-sm">{item.icon} {item.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5" />
                Music & Atmosphere
              </h2>
              <Select value={selectedMusic} onValueChange={setSelectedMusic}>
                <SelectTrigger>
                  <SelectValue placeholder="Select music style" />
                </SelectTrigger>
                <SelectContent>
                  {musicStyles.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      <div>
                        <p className="font-medium">{style.icon} {style.name}</p>
                        <p className="text-xs text-muted-foreground">{style.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Animation Style
              </h2>
              <div className="space-y-2 mb-6">
                {animationStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setAnimationStyle(style.id)}
                    className={cn(
                      'w-full p-3 rounded-lg border-2 text-left transition-all',
                      animationStyle === style.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-border hover:border-primary-300'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{style.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{style.name}</p>
                        <p className="text-xs text-muted-foreground">{style.description}</p>
                      </div>
                      {animationStyle === style.id && <Sparkles className="w-5 h-5 text-primary-500 ml-auto" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duration</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="3"
                      max="60"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-16">{duration}s</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">FPS</label>
                    <Select value={fps.toString()} onValueChange={(v) => setFps(parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[24, 30, 60].map(f => <SelectItem key={f} value={f.toString()}>{f} fps</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Resolution</label>
                    <Select value={resolution} onValueChange={setResolution}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['480p', '720p', '1080p', '2K', '4K'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
                <p className="font-semibold">Estimated Credits: <span className="text-primary-500">{estimatedCredits}</span></p>
                <p className="text-xs text-muted-foreground mt-1">Base: 20 • Clothing: +{selectedClothing.length * 2} • Accessories: +{selectedAccessories.length} • Duration: +{duration > 10 ? 10 : 0}</p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (!prompt.trim() && !selectedCharacter)}
                className="w-full mt-4 py-3 text-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Generating... {progress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate African Cartoon
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="mt-4">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {progress < 20 && 'Initializing AI models...'}
                    {progress >= 20 && progress < 50 && 'Designing character...'}
                    {progress >= 50 && progress < 70 && 'Composing scene...'}
                    {progress >= 70 && progress < 90 && 'Animating...'}
                    {progress >= 90 && 'Rendering final video...'}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-6">
              <h3 className="font-semibold text-primary-700 dark:text-primary-300 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Pro Tips
              </h3>
              <ul className="text-sm text-primary-600 dark:text-primary-400 space-y-2">
                <li className="flex items-start gap-2">• Start with a clear character + setting</li>
                <li className="flex items-start gap-2">• Use specific cultural details</li>
                <li className="flex items-start gap-2">• Keep prompts under 500 characters</li>
                <li className="flex items-start gap-2">• Match music to scene mood</li>
                <li className="flex items-start gap-2">• 5-10s for social media clips</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}