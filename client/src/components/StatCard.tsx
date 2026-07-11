'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  variant?: 'primary' | 'success' | 'warning' | 'info';
  color?: string;
  description?: string;
}

export function StatCard({ title, value, change, icon: Icon, variant = 'primary', color, description }: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const variantColors: Record<string, string> = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  };

  const iconColor = color || variantColors[variant] || variantColors.primary;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : isNegative ? (
                <TrendingDown className="w-4 h-4 text-red-600" />
              ) : (
                <Minus className="w-4 h-4 text-gray-600" />
              )}
              <span className={cn('text-sm font-medium', isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600')}>
                {isPositive ? '+' : ''}{change}% vs last period
              </span>
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}