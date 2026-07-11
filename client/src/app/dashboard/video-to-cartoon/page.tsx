'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Video, X, Loader2, Settings, Palette, Layers, Music, Subtitles, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

const styles = [
  { value: 'ANIME', label: 'Anime', description: 'Japanese animation style' },
  { value: 'COMIC', label: 'Comic Book', description: 'Bold lines, halftone effects' },
  { value: 'PIXAR_STYLE', label: 'Pixar Style', description: '3D animated movie look' },
  { value: 'DISNEY_STYLE', label: 'Disney Style', description: 'Classic Disney animation' },
  { value: 'AFRICAN_CARTOON', label: 'African Cartoon', description: 'Authentic African art style' },
  { value: 'MANGA', label: 'Manga', description: 'Black & white manga style' },
  { value: 'CHIBI', label: 'Chibi', description: 'Cute super-deformed style' },
  { value: 'GHIBLI_STYLE', label: 'Ghibli Style', description: 'Studio Ghibli aesthetic' },
  { value: 'WATERCOLOR', label: 'Watercolor', description: 'Soft painted look' },
  { value: 'OIL_PAINTING', label: 'Oil Painting', description: 'Textured artistic style' },
  { value: 'PENCIL_SKETCH', label: 'Pencil Sketch', description: 'Hand-drawn sketch effect' },
  { value: 'CLAYMATION', label: 'Claymation', description: 'Stop-motion clay look' },
];

const qualities = [
  { value: 'LOW_480P', label: '480p', description: 'Fast, lower quality' },
  { value: 'MEDIUM_720P', label: '720p HD', description: 'Balanced quality/speed' },
  { value: 'HIGH_1080P', label: '1080p Full HD', description: 'High quality' },
  { value: 'ULTRA_2K', label: '2K', description: 'Very high quality' },
  { value: 'ULTRA_4K', label: '4K Ultra HD', description: 'Maximum quality (slow)' },
];

export default function VideoToCartoonPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [style, setStyle] = useState('AFRICAN_CARTOON');
  const [quality, setQuality] = useState('MEDIUM_720P');
  const [fps, setFps] = useState(30);
  const [enhanceAudio, setEnhanceAudio] = useState(true);
  const [generateSubtitles, setGenerateSubtitles] = useState(false);
  const [subtitleLanguage, setSubtitleLanguage] = useState('en');
  const [replaceBackground, setReplaceBackground] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState('SAVANNA');

  const onDrop = (acceptedFiles: File[]) => {
    const acceptedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
    const file = acceptedFiles[0];
    
    if (!acceptedTypes.includes(file.type)) {
      alert('Please upload a valid video file (MP4, MOV, AVI, MKV, WebM)');
      return;
    }
    
    if (file.size > 500 * 1024 * 1024) {
      alert('File size must be less than 500MB');
      return;
    }
    
    setFile(file);
    setUploadProgress(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
      'video/x-matroska': ['.mkv'],
      'video/webm': ['.webm'],
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024,
  });

  const handleStartProcessing = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    
    // Simulate upload
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 200);
    
    try {
      // TODO: Actually call API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploadProgress(100);
      alert('Processing started! Check your Projects dashboard for progress.');
    } catch (error) {
      alert('Failed to start processing');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Video to Cartoon</h1>
          <p className="text-muted-foreground mt-1">
            Transform your videos into stunning cartoon animations with AI-powered style transfer.
            Choose from 15+ styles including our exclusive African Cartoon pack.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Upload Video
              </h2>
              
              <div
                {...getRootProps()}
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                  isDragActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-border hover:border-primary-300 dark:hover:border-primary-700'
                )}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                {file ? (
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Video className="w-8 h-8 text-primary-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {!isUploading && !uploadProgress && (
                      <Button onClick={handleStartProcessing} className="w-full" size="lg">
                        Start Processing
                        <Loader2 className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-foreground mb-1">
                      Drag & drop your video here, or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      MP4, MOV, AVI, MKV, WebM up to 500MB
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports videos up to 5 minutes • 30fps recommended
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Animation Style
              </h2>
              
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <div>
                        <p className="font-medium">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Settings
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quality</label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qualities.map((q) => (
                        <SelectItem key={q.value} value={q.value}>
                          <div>
                            <p className="font-medium">{q.label}</p>
                            <p className="text-xs text-muted-foreground">{q.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Frame Rate</label>
                  <Select value={fps.toString()} onValueChange={(v) => setFps(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[24, 30, 60].map((f) => (
                        <SelectItem key={f} value={f.toString()}>{f} fps</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enhanceAudio}
                    onChange={(e) => setEnhanceAudio(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm">Enhance audio (noise reduction, normalization)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateSubtitles}
                    onChange={(e) => setGenerateSubtitles(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm">Generate subtitles</span>
                </label>
              </div>

              {generateSubtitles && (
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle Language</label>
                  <Select value={subtitleLanguage} onValueChange={setSubtitleLanguage}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['en', 'sw', 'yo', 'ig', 'zu', 'am', 'fr', 'ar', 'pt', 'ha'].map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={replaceBackground}
                    onChange={(e) => setReplaceBackground(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm">Replace background</span>
                </label>
                {replaceBackground && (
                  <Select value={backgroundStyle} onValueChange={setBackgroundStyle}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Background style" />
                    </SelectTrigger>
                    <SelectContent>
                      {['SAVANNA', 'VILLAGE', 'MARKET', 'CITY', 'FOREST', 'BEACH', 'DESERT', 'MOUNTAIN'].map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg.charAt(0) + bg.slice(1).toLowerCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Estimated Credits</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base processing</span>
                  <span className="font-medium">15 credits</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Style: {styles.find(s => s.value === style)?.label}</span>
                  <span className="font-medium">+5 credits</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quality: {qualities.find(q => q.value === quality)?.label}</span>
                  <span className="font-medium">
                    +{quality === 'ULTRA_4K' ? 20 : quality === 'ULTRA_2K' ? 10 : quality === 'HIGH_1080P' ? 5 : 0} credits
                  </span>
                </div>
                {generateSubtitles && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtitles generation</span>
                    <span className="font-medium">+3 credits</span>
                  </div>
                )}
                {replaceBackground && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Background replacement</span>
                    <span className="font-medium">+8 credits</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    {15 + 5 + (quality === 'ULTRA_4K' ? 20 : quality === 'ULTRA_2K' ? 10 : quality === 'HIGH_1080P' ? 5 : 0) + 
                      (generateSubtitles ? 3 : 0) + (replaceBackground ? 8 : 0)} credits
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Tips for Best Results</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><Video className="w-4 h-4 shrink-0 mt-0.5" /> Use well-lit videos with clear subjects</li>
                <li className="flex items-start gap-2"><Video className="w-4 h-4 shrink-0 mt-0.5" /> Avoid rapid camera movements</li>
                <li className="flex items-start gap-2"><Video className="w-4 h-4 shrink-0 mt-0.5" /> Keep videos under 2 minutes for faster processing</li>
                <li className="flex items-start gap-2"><Video className="w-4 h-4 shrink-0 mt-0.5" /> African styles work best with cultural content</li>
                <li className="flex items-start gap-2"><Video className="w-4 h-4 shrink-0 mt-0.5" /> 1080p input gives best output quality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}