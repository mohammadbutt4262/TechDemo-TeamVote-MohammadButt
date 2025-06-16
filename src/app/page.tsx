'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LOCALSTORAGE_KEY = 'teamvote_username';

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem(LOCALSTORAGE_KEY);
    if (storedUsername) {
      router.replace('/ideas');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      <p className="mt-6 text-lg text-muted-foreground">Loading your TeamVote experience...</p>
    </div>
  );
}
