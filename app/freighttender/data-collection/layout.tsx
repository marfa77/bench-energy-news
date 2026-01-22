import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Collection & Processing',
  description: 'FreightTender Data Collection Policy - Detailed information about what data we collect, how it is processed, and why it is necessary.',
};

export default function DataCollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

