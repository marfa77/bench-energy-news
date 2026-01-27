import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FreightTender Capabilities - Enterprise Closed Tender Platform',
  description: 'Detailed capabilities of FreightTender: closed tender logic, structured offers, management visibility, audit trail, and C-level value for commodity and chemical trading companies.',
  keywords: [
    'freight tender capabilities',
    'closed tender system',
    'freight management',
    'audit trail',
    'governance',
    'compliance',
    'C-level value',
    'coal freight rates',
    'coal logistics',
    'coal logistics policy',
    'coal logistics management',
    'freight cost optimization',
    'executive freight solutions',
    'freight governance',
    'coal logistics platform',
    'freight procurement governance',
    'CEO freight management',
    'CFO freight cost control',
  ],
};

export default function CapabilitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

