import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FreightTender - Closed Freight Tenders for Commodity & Chemical Traders',
  description: 'Closed freight tender platform for commodity and chemical trading companies. Structured offers, closed competition, full auditability.',
  keywords: 'freight tender, commodity trading, chemical trading, freight procurement, closed tender, audit trail',
};

export default function FreightTenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

