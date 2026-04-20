/**
 * Codeforces API Utility
 * Fetch problems from the public problemset API
 */

export const fetchProblems = async () => {
  const response = await fetch('https://codeforces.com/api/problemset.problems');

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(data.comment || 'Failed to fetch problems from Codeforces');
  }

  // The API returns an object { status, result: { problems, problemStatistics } }
  // We merge problemStatistics into problems to easily access solvedCount
  const problems = data.result.problems;
  const stats = data.result.problemStatistics;

  // They are guaranteed to be parallel arrays by the Codeforces API
  return problems.map((prob, i) => ({
    ...prob,
    solvedCount: stats[i]?.solvedCount || 0
  }));
};

/**
 * Fetch a specific user's submission status
 * Extracted so we can filter only OK submissions
 */
export const fetchUserStatus = async (handle) => {
  const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user status');
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(data.comment || 'Error retrieving user submissions');
  }

  return data.result;
};

/**
 * Fetch a specific user's contest rating history
 */
export const fetchUserRating = async (handle) => {
  const response = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user rating history');
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(data.comment || 'Error retrieving user rating history');
  }

  return data.result;
};
