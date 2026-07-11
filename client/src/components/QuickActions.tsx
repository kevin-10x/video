'use client';

import { cn } from '@/lib/utils';
import { Video, Sparkles, Image, Library, Download, Settings } from 'lucide-react';

const actions = [
  {
    name: 'Video to Cartoon',
    description: 'Transform videos into cartoons',
    href: '/dashboard/video-to-cartoon',
    icon: Video,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    name: 'African Generator',
    description: 'Create African cartoon stories',
    href: '/dashboard/african-generator',
    icon: Sparkles,
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    name: 'Image to Cartoon',
    description: 'Convert images to cartoon style',
    href: '/dashboard/image-to-cartoon',
    icon: Image,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    name: 'Asset Library',
    description: 'Browse African characters & backgrounds',
    href: '/dashboard/assets',
    icon: Library,
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    name: 'My Exports',
    description: 'Download completed videos',
    href: '/dashboard/exports',
    icon: Download,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  },
  {
    name: 'Settings',
    description: 'Manage account & preferences',
    href: '/dashboard/settings',
    icon: Settings,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  },
];

export function QuickActions() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action) => (
          <a
            key={action.name}
            href={action.href}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-primary-500/50 transition-all duration-200 group'
            )}
          >
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', action.color)}>
              <action.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground group-hover:text-primary-600 transition-colors">{action.name}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}