'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UsernameInputProps {
  onUsernameSet: (username: string) => void;
  initialUsername?: string | null;
}

export function UsernameInput({ onUsernameSet, initialUsername }: UsernameInputProps) {
  const [inputUsername, setInputUsername] = useState('');

  useEffect(() => {
    if (initialUsername) {
      setInputUsername(initialUsername);
    }
  }, [initialUsername]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      onUsernameSet(inputUsername.trim());
    }
  };

  return (
    <Card className="w-full shadow-xl border border-border">
      <CardHeader>
        <CardTitle className="font-headline text-xl md:text-2xl text-center text-primary">
          Set Your Username
        </CardTitle>
        <CardDescription className="text-center text-sm">
          This name will be displayed with your ideas and votes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username-input" className="sr-only">Username</Label>
            <Input
              id="username-input"
              type="text"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="e.g., Innovator_XYZ"
              className="mt-1 text-base md:text-lg py-2.5 md:py-3"
              required
              aria-label="Enter your username"
            />
          </div>
          <Button type="submit" className="w-full text-base md:text-lg py-2.5 md:py-3">
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
