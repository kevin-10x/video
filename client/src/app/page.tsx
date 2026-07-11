'use client';

import Link from 'next/link';
import { Video, Sparkles, Zap, Globe, Users, PlayCircle, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">AfroToon AI</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Features
              </Link>
              <Link href="#styles" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                African Styles
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Dashboard
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Sign In
              </Link>
              <Link href="/auth/register" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
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
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Now with African Animation Pack
              </div>
              <h1 className="font-bold text-5xl lg:text-7xl text-gray-900 dark:text-white mb-6">
                Create African{' '}
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Cartoon Videos
                </span>
                {' '}with AI
              </h1>
              <p className="text-lg lg:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Transform videos into cartoons or generate authentic African animations from text.
                Featuring Maasai warriors, Yoruba royalty, Zulu dancers, and 50+ African cultures.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/register"
                  className="group w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25"
                >
                  Start Creating Free
                  <ArrowRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#demo"
                  className="w-full sm:w-auto border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
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
              <h2 className="font-bold text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
                Powerful AI Animation Tools
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Everything you need to create professional cartoon videos
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Video, title: 'Video to Cartoon', desc: 'Transform any video into stunning cartoon animations with AI-powered style transfer.' },
                { icon: Sparkles, title: 'African Cartoon Generator', desc: 'Create authentic African characters, backgrounds, and stories with cultural accuracy.' },
                { icon: Zap, title: 'Real-time Processing', desc: 'Fast GPU-accelerated rendering with progress tracking and live previews.' },
                { icon: Globe, title: 'Multilingual Support', desc: 'Generate content in Swahili, Yoruba, Igbo, Zulu, Amharic, and 50+ languages.' },
                { icon: Users, title: 'Team Collaboration', desc: 'Work together on projects with shared assets, comments, and version control.' },
                { icon: PlayCircle, title: 'Export Anywhere', desc: 'Export to MP4, MOV, GIF, WebM optimized for YouTube, TikTok, Instagram.' },
              ].map((feature, index) => (
                <div key={feature.title} className="group p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="styles" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-bold text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
                Authentic African Styles
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Culturally accurate characters, clothing, and environments from across the continent
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                { name: 'Maasai', region: 'East Africa', icon: 'home' },
                { name: 'Yoruba', region: 'West Africa', icon: 'crown' },
                { name: 'Zulu', region: 'Southern Africa', icon: 'shield' },
                { name: 'Kente', region: 'Ghana', icon: 'palette' },
                { name: 'Ankara', region: 'Nigeria', icon: 'shirt' },
                { name: 'Dashiki', region: 'West Africa', icon: 'mask' },
              ].map((style) => (
                <div key={style.name} className="group p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 text-center">
                  <div className="text-4xl mb-3">{style.icon}</div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{style.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{style.region}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-bold text-4xl lg:text-5xl text-gray-900 dark:text-white mb-6">
                  Video to Cartoon in Minutes
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
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
                    <li key={item} className="flex items-center gap-3 text-gray-900 dark:text-white">
                      <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Try Video to Cartoon
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                  <span className="text-6xl">▶</span>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-lg max-w-xs">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Processing...</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full animate-pulse" style={{ width: '65%' }} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">Frame 1,247 / 1,800</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl mx-4 lg:mx-0 mt-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="font-bold text-4xl lg:text-5xl text-white mb-6">
                Ready to Create Your African Story?
              </h2>
              <p className="text-lg text-orange-100 mb-8">
                Join thousands of creators making authentic African animations. Free tier includes 100 credits.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-orange-50 transition-colors"
              >
                Start Free - No Credit Card Required
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">AfroToon AI</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Empowering African storytelling through AI animation technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Video to Cartoon</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">African Generator</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Character Creator</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Asset Library</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Tutorials</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 AfroToon AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}