export interface Idea {
  id: number;
  title: string;
  description: string;
  posterUsername: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  currentUserVote?: 'upvote' | 'downvote' | null;
}

export type VoteType = 'upvote' | 'downvote';
