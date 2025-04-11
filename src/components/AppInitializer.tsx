'use client';

import { useEffect } from 'react';
import { initializeApp } from '../lib/init-app';

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize the app on the client side
    initializeApp();
  }, []);

  return <>{children}</>;
}
