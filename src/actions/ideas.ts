'use server';

import { revalidatePath } from 'next/cache';
import { db, type IdeaSchema, type VoteSchema } from '@/lib/db';
import type { Idea, VoteType } from '@/types';
import { getIoInstance, VOTE_UPDATE_EVENT } from '@/lib/get-io-instance';

function logDetailedError(actionName: string, error: unknown) {
  console.error(`Detailed error in ${actionName}:`, {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    name: error instanceof Error ? error.name : undefined,
    cause: error instanceof Error && error.cause !== undefined ? error.cause : undefined,
    errorObjectString: JSON.stringify(error, Object.getOwnPropertyNames(error).filter(prop => prop !== 'stack'), 2) // Avoid excessively long stack in JSON
  });
}

export async function getIdeas(currentUsername: string | null): Promise<Idea[]> {
  try {
    const ideasQuery = db.prepare('SELECT * FROM Ideas ORDER BY createdAt DESC');
    const ideasFromDb = ideasQuery.all() as IdeaSchema[];

    const ideasWithVoteCounts: Idea[] = ideasFromDb.map((ideaRecord) => {
      const votesQuery = db.prepare('SELECT voteType, voterUsername FROM Votes WHERE ideaId = ?');
      const votes = votesQuery.all(ideaRecord.id) as Pick<VoteSchema, 'voteType' | 'voterUsername'>[];
      
      let upvotes = 0;
      let downvotes = 0;
      let currentUserVote: Idea['currentUserVote'] = null;

      votes.forEach(vote => {
        if (vote.voteType === 'upvote') {
          upvotes++;
        } else if (vote.voteType === 'downvote') {
          downvotes++;
        }
        if (currentUsername && vote.voterUsername === currentUsername) {
          currentUserVote = vote.voteType;
        }
      });

      return {
        id: ideaRecord.id,
        title: ideaRecord.title,
        description: ideaRecord.description,
        posterUsername: ideaRecord.posterUsername,
        createdAt: ideaRecord.createdAt,
        upvotes,
        downvotes,
        currentUserVote,
      };
    });
    
    return ideasWithVoteCounts;
  } catch (error) {
    logDetailedError('getIdeas', error);
    throw new Error('Could not retrieve ideas. Please check server logs for details.');
  }
}

export async function addIdea({ title, description }: { title: string; description: string; }) {
  const posterUsername = "Anonymous"; 
  
  if (!title.trim() || !description.trim()) {
    throw new Error('Title and description cannot be empty.');
  }

  try {
    const stmt = db.prepare('INSERT INTO Ideas (title, description, posterUsername) VALUES (?, ?, ?)');
    const info = stmt.run(title, description, posterUsername);
    
    revalidatePath('/ideas'); 

    const io = getIoInstance();
    if (io) {
      const newIdeaQuery = db.prepare('SELECT * FROM Ideas WHERE id = ?');
      const newIdeaRecord = newIdeaQuery.get(info.lastInsertRowid) as IdeaSchema;
      if (newIdeaRecord) {
        const newIdeaForBroadcast: Idea = {
          id: newIdeaRecord.id,
          title: newIdeaRecord.title,
          description: newIdeaRecord.description,
          posterUsername: newIdeaRecord.posterUsername,
          createdAt: newIdeaRecord.createdAt,
          upvotes: 0,
          downvotes: 0,
          currentUserVote: null, 
        };
        io.emit('NEW_IDEA_EVENT', newIdeaForBroadcast);
      }
    }
    return { success: true, message: 'Idea added anonymously!' };
  } catch (error) {
    logDetailedError('addIdea', error);
    throw new Error('Could not add idea. Please check server logs for details.');
  }
}

export async function voteOnIdea({ ideaId, voterUsername, voteType }: { ideaId: number; voterUsername: string; voteType: VoteType }) {
  if (!voterUsername) {
    throw new Error('Username is required to vote.');
  }

  try {
    const existingVoteQuery = db.prepare('SELECT id, voteType FROM Votes WHERE ideaId = ? AND voterUsername = ?');
    const existingVote = existingVoteQuery.get(ideaId, voterUsername) as Pick<VoteSchema, 'id' | 'voteType'> | undefined;

    if (existingVote) {
      if (existingVote.voteType === voteType) { 
        const deleteStmt = db.prepare('DELETE FROM Votes WHERE id = ?');
        deleteStmt.run(existingVote.id);
      } else { 
        const updateStmt = db.prepare('UPDATE Votes SET voteType = ? WHERE id = ?');
        updateStmt.run(voteType, existingVote.id);
      }
    } else { 
      const insertStmt = db.prepare('INSERT INTO Votes (ideaId, voterUsername, voteType) VALUES (?, ?, ?)');
      insertStmt.run(ideaId, voterUsername, voteType);
    }
    
    revalidatePath('/ideas'); 

    const votesQuery = db.prepare('SELECT voteType FROM Votes WHERE ideaId = ?');
    const votes = votesQuery.all(ideaId) as Pick<VoteSchema, 'voteType'>[];
    let upvotes = 0;
    let downvotes = 0;
    votes.forEach(vote => {
      if (vote.voteType === 'upvote') upvotes++;
      else if (vote.voteType === 'downvote') downvotes++;
    });

    const io = getIoInstance();
    if (io) {
      io.emit(VOTE_UPDATE_EVENT, { ideaId, upvotes, downvotes });
    }
    
    return { success: true, message: 'Vote cast successfully!' };
  } catch (error) {
    logDetailedError('voteOnIdea', error);
    throw new Error('Could not cast vote. Please check server logs for details.');
  }
}
