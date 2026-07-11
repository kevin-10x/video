'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProjectCard } from '@/components/ProjectCard';
import { StatCard } from '@/components/StatCard';
import { QuickActions } from '@/components/QuickActions';
import { RecentActivity } from '@/components/RecentActivity';
import { CreditBalance } from '@/components/CreditBalance';
import { Users, Video, Image, Download, TrendingUp, Clock, AlertCircle, CheckCircle, Plus } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = useAuthStore.getState().accessToken;
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await authApi.me();
        setAuth(response.data.user, token, useAuthStore.getState().refreshToken || '');
      } catch {
        useAuthStore.getState().logout();
        router.push('/login');
      }
    };
    
    initAuth();
  }, [router, setAuth, setLoading]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your projects.</p>
          </div>
          <CreditBalance />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Projects"
            value="12"
            change={16}
            icon={Video}
            variant="primary"
          />
          <StatCard
            title="Completed Videos"
            value="8"
            change={60}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Processing"
            value="2"
            change={0}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Credits Remaining"
            value="847"
            change={-5}
            icon={TrendingUp}
            variant="info"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Projects</h2>
              <a href="/dashboard/projects/new" className="text-sm text-primary-600 hover:underline">
                View all →
              </a>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {mockProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <QuickActions />
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const mockProjects = [
  {
    id: '1',
    name: 'Maasai Warrior Story',
    type: 'AFRICAN_CARTOON_GENERATOR',
    status: 'COMPLETED',
    style: 'AFRICAN_CARTOON',
    thumbnail: null,
    duration: 30,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    progress: 100,
  },
  {
    id: '2',
    name: 'Lagos Market Animation',
    type: 'VIDEO_TO_CARTOON',
    status: 'PROCESSING',
    style: 'ANIME',
    thumbnail: null,
    duration: 45,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    progress: 65,
  },
  {
    id: '3',
    name: 'Kente Pattern Explainer',
    type: 'AFRICAN_CARTOON_GENERATOR',
    status: 'COMPLETED',
    style: 'KENTE_STYLE',
    thumbnail: null,
    duration: 60,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    progress: 100,
  },
  {
    id: '4',
    name: 'Zulu Dance Tutorial',
    type: 'VIDEO_TO_CARTOON',
    status: 'FAILED',
    style: 'DISNEY_STYLE',
    thumbnail: null,
    duration: 0,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    progress: 0,
  },
];

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/dashboard/projects', icon: Video },
  { name: 'African Studio', href: '/dashboard/african-studio', icon: Image },
  { name: 'Assets', href: '/dashboard/assets', icon: Box },
  { name: 'Exports', href: '/dashboard/exports', icon: Download },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];