'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, CalendarDays } from 'lucide-react';
import { type Idea, type VoteType } from '@/types';
import { voteOnIdea } from '@/actions/ideas';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface IdeaCardProps {
  idea: Idea;
  currentUsername: string | null;
  onVote: () => void;
}

export function IdeaCard({ idea, currentUsername, onVote }: IdeaCardProps) {
  const { toast } = useToast();
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(idea.upvotes);
  const [optimisticDownvotes, setOptimisticDownvotes] = useState(idea.downvotes);
  const [optimisticUserVote, setOptimisticUserVote] = useState(idea.currentUserVote);
  const [isVoting, setIsVoting] = useState(false);
  
  useEffect(() => {
    setOptimisticUpvotes(idea.upvotes);
    setOptimisticDownvotes(idea.downvotes);
    setOptimisticUserVote(idea.currentUserVote);
  }, [idea.upvotes, idea.downvotes, idea.currentUserVote]);

  const handleVote = async (newVoteType: VoteType) => {
    if (!currentUsername) {
      toast({
        title: 'Login Required',
        description: 'Please set your username to vote.',
        variant: 'destructive',
      });
      return;
    }
    if (isVoting) return;

    setIsVoting(true);

    const previousUserVote = optimisticUserVote;
    const previousUpvotes = optimisticUpvotes;
    const previousDownvotes = optimisticDownvotes;

    let newOptimisticUpvotes = optimisticUpvotes;
    let newOptimisticDownvotes = optimisticDownvotes;
    let newOptimisticUserVoteApi: Idea['currentUserVote'] = null;

    if (previousUserVote === newVoteType) {
      if (newVoteType === 'upvote') newOptimisticUpvotes--;
      else newOptimisticDownvotes--;
      newOptimisticUserVoteApi = null;
    } else {
      if (previousUserVote === 'upvote') newOptimisticUpvotes--;
      else if (previousUserVote === 'downvote') newOptimisticDownvotes--;

      // Add effect of new vote
      if (newVoteType === 'upvote') newOptimisticUpvotes++;
      else newOptimisticDownvotes++;
      newOptimisticUserVoteApi = newVoteType;
    }
    
    setOptimisticUpvotes(newOptimisticUpvotes);
    setOptimisticDownvotes(newOptimisticDownvotes);
    setOptimisticUserVote(newOptimisticUserVoteApi);

    try {
      await voteOnIdea({ ideaId: idea.id, voterUsername: currentUsername, voteType: newVoteType });
      onVote(); 
    } catch (error) {
      setOptimisticUpvotes(previousUpvotes);
      setOptimisticDownvotes(previousDownvotes);
      setOptimisticUserVote(previousUserVote);
      toast({
        title: 'Vote Error',
        description: error instanceof Error ? error.message : 'Could not cast vote.',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true });

  return (
    <Card className="w-full shadow-lg transition-all hover:shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl tracking-tight">{idea.title}</CardTitle>
        <CardDescription className="text-sm flex items-center gap-2 pt-1">
            <CalendarDays size={16} className="text-muted-foreground" /> {timeAgo} (Posted Anonymously)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90 leading-relaxed">{idea.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant={optimisticUserVote === 'upvote' ? 'default' : 'outline'}
              size="icon"
              onClick={() => handleVote('upvote')}
              disabled={!currentUsername || isVoting}
              aria-label="Upvote idea"
              className={`transition-all duration-150 ease-in-out ${optimisticUserVote === 'upvote' ? 'bg-green-600 hover:bg-green-700 text-white scale-110' : 'hover:bg-green-100'}`}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
            <span className="font-medium text-md text-green-600 min-w-[1.5rem] text-center">
              {optimisticUpvotes}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={optimisticUserVote === 'downvote' ? 'default' : 'outline'}
              size="icon"
              onClick={() => handleVote('downvote')}
              disabled={!currentUsername || isVoting}
              aria-label="Downvote idea"
              className={`transition-all duration-150 ease-in-out ${optimisticUserVote === 'downvote' ? 'bg-red-600 hover:bg-red-700 text-white scale-110' : 'hover:bg-red-100'}`}
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
            <span className="font-medium text-md text-red-600 min-w-[1.5rem] text-center">
              {optimisticDownvotes}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
