import type { Metadata } from 'next';
import siteMetadata from '@/app/metadata.json';
import DashboardContent from '@/components/dashboard-content';

export const metadata: Metadata = siteMetadata['/'];

export default function HomePage() {
  return <DashboardContent />;
}
