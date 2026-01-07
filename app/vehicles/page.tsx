import type { Metadata } from 'next';
import siteMetadata from '@/app/metadata.json';
import VehiclesListContent from '@/components/vehicles-list-content';

export const metadata: Metadata = siteMetadata['/vehicles'];

export default function VehiclesPage() {
  return <VehiclesListContent />;
}
