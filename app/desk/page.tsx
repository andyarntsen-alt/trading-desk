'use client';

import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

export default function DeskPage() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          window.location.href = '/sign-in';
          return;
        }
        if (isMounted) {
          setIsReady(true);
        }
      } catch {
        window.location.href = '/sign-in';
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          window.location.href = '/sign-in';
        }
      }
    );

    checkSession();

    // Apply full-screen styles to html/body
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
      // Cleanup on unmount
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading Trading Desk...
      </div>
    );
  }

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
