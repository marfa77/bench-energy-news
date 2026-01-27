'use client';

import { trackTelegramClick, trackEmailClick, trackTelegramSalesClick } from '@/app/lib/analytics';

interface ContactLinkProps {
  type: 'email' | 'telegram' | 'telegram_sales';
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export default function ContactLink({
  type,
  href,
  children,
  className,
  target,
  rel,
}: ContactLinkProps) {
  const handleClick = () => {
    if (type === 'email') {
      const email = href.replace('mailto:', '');
      trackEmailClick(email);
    } else if (type === 'telegram') {
      const username = href.includes('@') ? href.split('@')[1] : href;
      trackTelegramClick(username);
    } else if (type === 'telegram_sales') {
      const username = href.includes('@') ? href.split('@')[1] : href;
      trackTelegramSalesClick(username);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      target={target}
      rel={rel}
    >
      {children}
    </a>
  );
}
