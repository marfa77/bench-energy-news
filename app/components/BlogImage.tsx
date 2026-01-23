'use client';

import { useState } from 'react';

interface BlogImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function BlogImage({ src, alt, className = '' }: BlogImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center text-gray-400 text-sm p-4 text-center bg-gradient-to-br from-green-100 to-emerald-100 ${className}`}>
        <span className="text-4xl">✍️</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
