'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UsernameInput } from '@/components/UsernameInput';

const LOCALSTORAGE_KEY = 'teamvote_username';

export default function LoginPage() {
  const router = useRouter();
  const [initialUsername, setInitialUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem(LOCALSTORAGE_KEY);
    if (storedUsername) {
      setInitialUsername(storedUsername);
    }
    setIsLoading(false);
  }, []);

  const handleUsernameSet = (newUsername: string) => {
    localStorage.setItem(LOCALSTORAGE_KEY, newUsername.trim());
    router.push('/ideas');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-2">TeamVote</h1>
        <p className="text-muted-foreground text-lg md:text-xl">Set your username to join the discussion.</p>
      </header>
      <main className="w-full max-w-md">
        <UsernameInput 
          onUsernameSet={handleUsernameSet} 
          initialUsername={initialUsername} 
        />
      </main>
      <footer className="text-center py-8 mt-10">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()}  TeamVote. All rights reserved.</p>
      </footer>
    </div>
  );
}
