"use client"

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Dynamically import the dashboard content with no SSR
const DashboardContent = dynamic(() => import('@/components/dashboard/DashboardContent'), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading dashboard..." />
});

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
