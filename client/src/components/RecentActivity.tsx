'use client';

import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { CheckCircle, Clock, AlertCircle, Video, Sparkles, Download, ExternalLink } from 'lucide-react';

const activities = [
  {
    id: '1',
    type: 'job_completed',
    title: 'Video to Cartoon completed',
    description: 'Maasai Warrior Story has finished processing',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'success',
    action: { label: 'View Export', href: '/dashboard/exports?project=1' },
  },
  {
    id: '2',
    type: 'job_started',
    title: 'Processing started',
    description: 'Lagos Market Animation is now being processed',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: 'processing',
    action: { label: 'View Progress', href: '/dashboard/projects/2' },
  },
  {
    id: '3',
    type: 'export_ready',
    title: 'Export ready for download',
    description: 'Kente Pattern Explainer (4K) is ready',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'success',
    action: { label: 'Download', href: '/dashboard/exports?project=3' },
  },
  {
    id: '4',
    type: 'job_failed',
    title: 'Processing failed',
    description: 'Zulu Dance Tutorial encountered an error',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: 'error',
    action: { label: 'Retry', href: '/dashboard/projects/4' },
  },
  {
    id: '5',
    type: 'asset_uploaded',
    title: 'New asset uploaded',
    description: 'African drum beats added to library',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    status: 'info',
    action: { label: 'View', href: '/dashboard/assets' },
  },
];

const statusConfig = {
  success: { icon: CheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
  processing: { icon: Clock, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' },
  error: { icon: AlertCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
  info: { icon: Video, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
};

export function RecentActivity() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <a href="/dashboard/activity" className="text-sm text-primary-600 hover:underline">
          View all
        </a>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => {
          const config = statusConfig[activity.status as keyof typeof statusConfig];
          const Icon = config.icon;
          return (
            <div
              key={activity.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors'
              )}
            >
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', config.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(activity.timestamp)}</p>
              </div>
              {activity.action && (
                <a
                  href={activity.action.href}
                  className="text-sm text-primary-600 hover:underline whitespace-nowrap mt-1 flex-shrink-0"
                >
                  {activity.action.label}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}