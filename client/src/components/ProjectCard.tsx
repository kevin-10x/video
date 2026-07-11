'use client';

import { cn } from '@/lib/utils';
import { formatDuration, formatFileSize, formatRelativeTime } from '@/lib/utils';
import { Video, Clock, Download, CheckCircle, AlertCircle, Loader2, Sparkles, FileText, Image } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    type: string;
    status: string;
    style?: string;
    quality?: string;
    duration?: number;
    thumbnailUrl?: string;
    progress?: number;
    currentJob?: {
      id: string;
      status: string;
      progress: number;
      currentStep?: string;
    };
    exports?: Array<{
      id: string;
      quality: string;
      format: string;
      status: string;
      url?: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
  onClick?: () => void;
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  DRAFT: { icon: Video, color: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400', label: 'Draft' },
  PROCESSING: { icon: Loader2, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', label: 'Processing' },
  COMPLETED: { icon: CheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400', label: 'Completed' },
  FAILED: { icon: AlertCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400', label: 'Failed' },
  ARCHIVED: { icon: Video, color: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400', label: 'Archived' },
};

const typeConfig: Record<string, { icon: any; label: string }> = {
  VIDEO_TO_CARTOON: { icon: Video, label: 'Video → Cartoon' },
  AFRICAN_CARTOON_GENERATOR: { icon: Sparkles, label: 'African Generator' },
  TEXT_TO_CARTOON: { icon: FileText, label: 'Text → Cartoon' },
  IMAGE_TO_CARTOON: { icon: Image, label: 'Image → Cartoon' },
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const status = statusConfig[project.status] || statusConfig.DRAFT;
  const type = typeConfig[project.type] || typeConfig.VIDEO_TO_CARTOON;
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  return (
    <article
      className={cn(
        'bg-card border border-border rounded-xl overflow-hidden transition-all hover:shadow-lg hover:border-primary-500/30',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', status.color)}>
            {status.label}
          </span>
        </div>
        {project.progress && project.progress > 0 && project.progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <TypeIcon className="w-3 h-3" />
              <span>{type.label}</span>
              {project.style && <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{project.style}</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {project.duration ? formatDuration(project.duration) : '—'}
          </span>
          {project.quality && (
            <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium">{project.quality}</span>
          )}
          <span className="flex items-center gap-1">
            <span className="w-3 h-3" />
            {formatRelativeTime(project.updatedAt)}
          </span>
        </div>
        
        {project.currentJob && project.status === 'PROCESSING' && (
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{project.currentJob.currentStep || 'Processing...'}</span>
              <span className="font-medium">{project.currentJob.progress}%</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${project.currentJob.progress}%` }}
              />
            </div>
          </div>
        )}
        
        {project.exports && project.exports.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {project.exports.slice(0, 3).map((exp) => (
              <a
                key={exp.id}
                href={exp.url || `#`}
                className={cn(
                  'px-2 py-1 rounded text-xs font-medium border transition-colors',
                  exp.status === 'COMPLETED'
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                    : 'bg-muted text-muted-foreground border-border'
                )}
              >
                {exp.quality} {exp.format}
              </a>
            ))}
            {project.exports.length > 3 && (
              <span className="px-2 py-1 rounded text-xs text-muted-foreground border border-border">
                +{project.exports.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}