// src/utils/lessonLoader.ts

export interface LessonContentResponse {
  content: string;
}

export async function loadLessonContent(
  moduleTitle: string, 
  lessonTitle: string
): Promise<string> {
  try {
    const response = await fetch('/api/generate-lesson-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleTitle, lessonTitle }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate lesson content.');
    }

    const data: LessonContentResponse = await response.json();
    return data.content;
  } catch (error) {
    console.error(`Error loading content for lesson "${lessonTitle}":`, error);
    throw error;
  }
}

// Utility function to check if lesson content is already loaded
export function isLessonContentLoaded(content: string): boolean {
  return content.trim() !== "";
}

// Cache for storing loaded content to avoid re-fetching
const contentCache = new Map<string, string>();

export async function loadLessonContentWithCache(
  moduleTitle: string, 
  lessonTitle: string
): Promise<string> {
  const cacheKey = `${moduleTitle}|${lessonTitle}`;
  
  // Check cache first
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey)!;
  }
  
  // Load content and cache it
  const content = await loadLessonContent(moduleTitle, lessonTitle);
  contentCache.set(cacheKey, content);
  
  return content;
}
