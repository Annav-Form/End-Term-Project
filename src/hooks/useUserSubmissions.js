import { useQuery } from '@tanstack/react-query';
import { fetchUserStatus } from '../api/codeforces';

/**
 * Custom hook to fetch a user's submissions array.
 * Unlike useUserStatus which returns a Set for O(1) table filtering,
 * this returns the raw submissions, filtered for "OK", to retain 
 * metadata like creationTimeSeconds for time-series charts.
 */
export const useUserSubmissions = (handle) => {
  return useQuery({
    queryKey: ['userSubmissions', handle],
    queryFn: () => fetchUserStatus(handle),
    enabled: !!handle,
    staleTime: 5 * 60 * 1000, 
    select: (submissions) => submissions.filter((sub) => sub.verdict === 'OK')
  });
};

