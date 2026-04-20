import { useQuery } from '@tanstack/react-query';
import { fetchUserRating } from '../api/codeforces';

/**
 * Custom hook to fetch a user's contest rating history.
 */
export const useUserRating = (handle) => {
  return useQuery({
    queryKey: ['userRating', handle],
    queryFn: () => fetchUserRating(handle),
    enabled: !!handle, 
    staleTime: 60 * 60 * 1000, // 1 hour (contests don't happen often)
    gcTime: 2 * 60 * 60 * 1000,
  });
};
