/** @jsxImportSource react */
'use client';

import Link from 'next/link';
import {
  Video,
  Zap,
  Globe,
  Users,
  Sparkles,
  ArrowRight,
  PlayCircle,
  Home,
  Crown,
  Shield,
  Palette,
  Shirt,
  Mask,
} from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'Video to Cartoon',
    description: 'Transform any video into stunning cartoon animations with AI-powered style transfer.',
  },
  {
    icon: Sparkles,
    title: 'African Cartoon Generator',
    description: 'Create authentic African characters, backgrounds, and stories with cultural accuracy.',
  },
  {
    icon: Zap,
    title: 'Real-time Processing',
    description: 'Fast GPU-accelerated rendering with progress tracking and live previews.',
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    description: 'Generate content in Swahili, Yoruba, Igbo, Zulu, Amharic, and 50+ languages.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together on projects with shared assets, comments, and version control.',
  },
  {
    icon: PlayCircle,
    title: 'Export Anywhere',
    description: 'Export to MP4, MOV, GIF, WebM optimized for YouTube, TikTok, Instagram.',
  },
];

const africanStyles = [
  { name: 'Maasai', region: 'East Africa', icon: Home },
  { name: 'Yoruba', region: 'West Africa', icon: Crown },
  { name: 'Zulu', region: 'Southern Africa', icon: Shield },
  { name: 'Kente', region: 'Ghana', icon: Palette },
  { name: 'Ankara', region: 'Nigeria', icon: Shirt },
  { name: 'Dashiki', region: 'West Africa', icon: Mask },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-african-earth/5 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">AfroToon AI</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#styles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                African Styles
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                Now with African Animation Pack
              </div>
              <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                Create African{' '}
                <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                  Cartoon Videos
                </span>
                {' '}with AI
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Transform videos into cartoons or generate authentic African animations from text.
                Featuring Maasai warriors, Yoruba royalty, Zulu dancers, and 50+ African cultures.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/register"
                  className="group w-full sm:w-auto bg-primary-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25"
                >
                  Start Creating Free
                  <ArrowRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#demo"
                  className="w-full sm:w-auto border-2 border-border bg-background/50 text-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-muted transition-all"
                >
                  Watch Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Powerful AI Animation Tools
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create professional cartoon videos
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="styles" className="py-20 lg:py-28 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Authentic African Styles
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Culturally accurate characters, clothing, and environments from across the continent
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {africanStyles.map((style) => (
                <div
                  key={style.name}
                  className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">
                    <style.icon className="w-10 h-10 mx-auto text-primary-500" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">{style.name}</h3>
                  <p className="text-sm text-muted-foreground">{style.region}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Video to Cartoon in Minutes
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Upload any video and our AI will transform it into a cartoon while preserving motion,
                  lip-sync, and expressions. Choose from 15+ animation styles including our exclusive African pack.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Automatic character detection & tracking',
                    'Lip-sync with multilingual voice support',
                    'Background replacement with African landscapes',
                    'Consistent character appearance across frames',
                    'Export up to 4K resolution',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground">
                      <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Try Video to Cartoon
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-primary-500/50" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-background border border-border p-4 rounded-xl shadow-lg max-w-xs">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Processing...</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full animate-pulse" style={{ width: '65%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">Frame 1,247 / 1,800</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl mx-4 lg:mx-0 mt-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Create Your African Story?
              </h2>
              <p className="text-lg text-primary-100 mb-8">
                Join thousands of creators making authentic African animations. Free tier includes 100 credits.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-primary-50 transition-colors"
              >
                Start Free - No Credit Card Required
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 36v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 6V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        </section>
      </main>

      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="font-display font-bold text-xl text-foreground">AfroToon AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering African storytelling through AI animation technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Video to Cartoon</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">African Generator</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Character Creator</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Asset Library</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Tutorials</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 AfroToon AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}