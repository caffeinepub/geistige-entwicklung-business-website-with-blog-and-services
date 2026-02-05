// Utility functions for daily visitor tracking

/**
 * Get current local date as YYYY-MM-DD string
 */
export function getCurrentLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely read from localStorage with fallback
 */
export function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('localStorage not available:', error);
    return null;
  }
}

/**
 * Safely write to localStorage with fallback
 */
export function safeLocalStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('localStorage not available:', error);
  }
}

/**
 * Get or generate a stable visitor session ID
 */
export function getOrCreateVisitorSessionId(): string {
  const key = 'visitor_session_id';
  let sessionId = safeLocalStorageGet(key);
  
  if (!sessionId) {
    // Generate a random session ID
    sessionId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    safeLocalStorageSet(key, sessionId);
  }
  
  return sessionId;
}

/**
 * Get the last tracked date for daily visitors
 */
export function getLastTrackedDate(): string | null {
  return safeLocalStorageGet('last_tracked_date');
}

/**
 * Set the last tracked date for daily visitors
 */
export function setLastTrackedDate(date: string): void {
  safeLocalStorageSet('last_tracked_date', date);
}

/**
 * Check if we should track a visit today
 */
export function shouldTrackVisitToday(): boolean {
  const today = getCurrentLocalDate();
  const lastTracked = getLastTrackedDate();
  return lastTracked !== today;
}
