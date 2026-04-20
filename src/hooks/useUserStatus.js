import { useQuery } from '@tanstack/react-query';
import { fetchUserStatus } from '../api/codeforces';

/**
 * Custom hook to fetch a user's submissions.
 * It automatically extracts unique solved problems into a Set.
 */
export const useUserStatus = (handle) => {
  return useQuery({
    queryKey: ['userStatus', handle],
    queryFn: () => fetchUserStatus(handle),
    enabled: !!handle, // Only run the query if a handle is provided
    staleTime: 5 * 60 * 1000, // 5 minutes (user might solve problems while using app)
    gcTime: 10 * 60 * 1000,
    select: (submissions) => {
      // Create a Set of strings formatted as "contestId-index" for O(1) lookup
      const solvedSet = new Set();
      
      submissions.forEach(sub => {
        if (sub.verdict === 'OK') {
          solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
        }
      });
      
      return solvedSet;
    }
  });
};
