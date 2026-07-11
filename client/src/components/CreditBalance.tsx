'use client';

import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { Wallet, Plus, AlertCircle } from 'lucide-react';

export function CreditBalance() {
  const { user } = useAuthStore();
  const credits = user?.credits || 0;
  const isLow = credits < 20;

  return (
    <div className={cn(
      'bg-card border border-border rounded-xl p-4',
      isLow && 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            isLow ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
          )}>
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Credits Available</p>
            <p className="text-2xl font-bold text-foreground">{credits}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLow && (
            <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full">
              <AlertCircle className="w-3 h-3" />
              Low credits
            </span>
          )}
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isLow ? 'bg-orange-500' : 'bg-primary-500'
          )}
          style={{ width: `${Math.min(credits / 100, 1) * 100}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1 text-right">
        Resets in {user?.creditsResetAt ? formatRelativeTime(user.creditsResetAt) : '30 days'}
      </p>
    </div>
  );
}