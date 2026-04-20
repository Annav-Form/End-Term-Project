import { useQuery } from '@tanstack/react-query';
import { fetchProblems } from '../api/codeforces';

/**
 * Custom hook to fetch and cache Codeforces problems.
 * Uses a 24-hour staleTime to prevent rate limiting as problemsets don't change very rapidly.
 */
export const useProblems = () => {
  return useQuery({
    queryKey: ['problems'],
    queryFn: fetchProblems,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    retry: 2
  });
};
