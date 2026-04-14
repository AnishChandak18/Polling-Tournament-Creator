/** Voting locks this long before scheduled kickoff (change vote until then). */
export const VOTE_LOCK_BEFORE_MS = 30 * 60 * 1000;

export function getVoteLockDeadline(matchDate: Date) {
  return new Date(matchDate.getTime() - VOTE_LOCK_BEFORE_MS);
}

/**
 * User may cast or change a vote only while match is still UPCOMING and
 * current time is strictly before (kickoff − 30 minutes).
 */
export function canVoteOnMatch(matchDate: Date, status: string) {
  if (status !== "UPCOMING") return false;
  return Date.now() < getVoteLockDeadline(matchDate).getTime();
}
