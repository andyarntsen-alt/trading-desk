'use client';

import { useEffect } from 'react';

export default function DeskPage() {
  useEffect(() => {
    // Apply full-screen styles to html/body
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    return () => {
      // Cleanup on unmount
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  return (
    <iframe
      src="/desk/index.html"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        display: 'block',
        background: '#000',
      }}
      title="Trading Desk"
    />
  );
}
