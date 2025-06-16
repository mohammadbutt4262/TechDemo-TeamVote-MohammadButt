'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AddIdeaForm } from '@/components/AddIdeaForm';
import { IdeaCard } from '@/components/IdeaCard';
import { getIdeas } from '@/actions/ideas';
import type { Idea } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { RefreshCw, Frown, WifiOff, User, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { io, type Socket } from 'socket.io-client';
import { VOTE_UPDATE_EVENT } from '@/lib/get-io-instance';

const LOCALSTORAGE_KEY = 'teamvote_username';

export default function IdeasPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem(LOCALSTORAGE_KEY);
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      router.replace('/login'); 
      return;
    }
    setIsPageLoading(false);
  }, [router]);

  const fetchIdeas = useCallback(async (showLoadingSpinner: boolean = true) => {
    const currentUsernameForFetch = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!currentUsernameForFetch) {
      router.replace('/login');
      return;
    }

    if (showLoadingSpinner) setIsLoadingIdeas(true);
    setError(null);
    try {
      const fetchedIdeas = await getIdeas(currentUsernameForFetch);
      setIdeas(fetchedIdeas);
    } catch (e) {
      console.error('Failed to fetch ideas:', e);
      setError(e instanceof Error ? e.message : 'Could not load ideas. Please try again.');
      toast({
        title: "Error fetching ideas",
        description: e instanceof Error ? e.message : "An unknown error occurred.",
        variant: "destructive"
      });
    } finally {
      if (showLoadingSpinner) setIsLoadingIdeas(false);
    }
  }, [toast, router]);

  useEffect(() => {
    if (!isPageLoading && username) { 
      fetchIdeas();

      socketRef.current = io({ path: '/api/socket' }); 

      socketRef.current.on('connect', () => {
        console.log('Socket.IO: Connected to server', socketRef.current?.id);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket.IO: Disconnected from server', reason);
      });
      
      socketRef.current.on('connect_error', (err) => {
        console.error('Socket.IO: Connection error', err);
        toast({
          title: "Real-time Error",
          description: "Could not connect for real-time updates. Some features might be delayed.",
          variant: "destructive",
        });
      });

      socketRef.current.on('error', (serverError) => {
        console.error('Socket.IO: Received "error" event from server:', serverError);
        toast({
          title: "Server Communication Error",
          description: typeof serverError === 'string' ? serverError : "An unexpected error occurred with real-time updates.",
          variant: "destructive",
        });
      });

      socketRef.current.on(VOTE_UPDATE_EVENT, (data: { ideaId: number; upvotes: number; downvotes: number }) => {
        setIdeas(currentIdeas =>
          currentIdeas.map(idea => {
            if (idea.id === data.ideaId) {
              return { ...idea, upvotes: data.upvotes, downvotes: data.downvotes };
            }
            return idea;
          })
        );
      });
      
      socketRef.current.on('NEW_IDEA_EVENT', (newIdea: Idea) => {
        setIdeas(currentIdeas => [newIdea, ...currentIdeas]);
      });

      return () => {
        if (socketRef.current) {
          console.log('Socket.IO: Disconnecting...');
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [isPageLoading, username, fetchIdeas, toast]);

  const handleIdeaAdded = () => {
  };

  const handleVote = () => {
    if (username) {
        getIdeas(username).then(updatedIdeas => {
            setIdeas(updatedIdeas);
        }).catch(e => console.error("Error refreshing ideas after vote for currentUserVote status", e));
    }
  };

  const handleChangeUser = () => {
    localStorage.removeItem(LOCALSTORAGE_KEY);
    setUsername(null); 
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    router.push('/login'); 
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col flex-grow">
      <header className="mb-6 md:mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b">
          <div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Tech Demo – TeamVote – Mohammad Butt</h1>
            <p className="text-muted-foreground text-md">Share and vote on your teams best ideas!</p>
          </div>
          {username && (
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User size={18} className="text-primary" /> 
                Logged in as: <strong className="text-primary font-semibold">{username}</strong>
              </div>
              <Button variant="outline" size="sm" onClick={handleChangeUser}>
                <LogOut size={16} className="mr-2" /> Change User
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow">
        {username && <AddIdeaForm currentUsername={username} onIdeaAdded={handleIdeaAdded} />}

        <section aria-labelledby="ideas-heading" className="mt-8">
          <h2 id="ideas-heading" className="font-headline text-2xl md:text-3xl font-semibold mb-6 text-primary/90">
            Ideas Showcase
          </h2>
          {isLoadingIdeas ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="w-full shadow-lg">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <Skeleton className="h-8 w-12 rounded-md" />
                      <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 bg-card rounded-lg shadow">
              <WifiOff className="mx-auto h-16 w-16 text-destructive mb-4" />
              <p className="text-destructive text-xl mb-2">Oops! Something went wrong.</p>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchIdeas()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Try Again
              </Button>
            </div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-lg shadow">
              <Frown className="mx-auto h-16 w-16 text-primary/70 mb-4" />
              <p className="text-xl text-muted-foreground">No ideas yet.</p>
              {username && <p className="text-muted-foreground">Be the first to add one!</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea) => (
                <IdeaCard 
                  key={idea.id} 
                  idea={idea} 
                  currentUsername={username} 
                  onVote={handleVote} 
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
