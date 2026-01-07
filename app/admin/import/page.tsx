import type { Metadata } from 'next';
import ImportDataContent from '@/components/import-data-content';

export const metadata: Metadata = {
  title: "Import dat - Admin",
  description: "Import dat z JSON souborů do databáze",
};

export default function ImportPage() {
  return <ImportDataContent />;
}
