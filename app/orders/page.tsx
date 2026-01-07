import type { Metadata } from 'next';
import siteMetadata from '@/app/metadata.json';
import OrdersListContent from '@/components/orders-list-content';

export const metadata: Metadata = siteMetadata['/orders'];

export default function OrdersPage() {
  return <OrdersListContent />;
}
