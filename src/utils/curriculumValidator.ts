// src/utils/curriculumValidator.ts

export interface Lesson {
  title: string;
  content: string;
}

export interface Module {
  id: number;
  title: string;
  objective_1: string;
  objective_2: string;
  objective_3: string;
  estimated_minutes: number;
  total_lessons: number;
  lessons: Lesson[];
}

export interface Curriculum {
  title: string;
  description: string;
  modules: Module[];
}

// Function to validate curriculum structure
export function validateCurriculumStructure(data: unknown): data is Curriculum {
  if (!data || typeof data !== 'object') {
    console.error('Curriculum data is not an object:', data);
    return false;
  }

  const curriculum = data as Record<string, unknown>;

  if (!curriculum.title || typeof curriculum.title !== 'string') {
    console.error('Curriculum title is missing or invalid:', curriculum.title);
    return false;
  }

  if (!curriculum.description || typeof curriculum.description !== 'string') {
    console.error('Curriculum description is missing or invalid:', curriculum.description);
    return false;
  }

  if (!Array.isArray(curriculum.modules)) {
    console.error('Curriculum modules is not an array:', curriculum.modules);
    return false;
  }

  // Validate each module
  for (let i = 0; i < curriculum.modules.length; i++) {
    const currentModule = curriculum.modules[i];
    if (!currentModule || typeof currentModule !== 'object') {
      console.error(`Module ${i} is not an object:`, currentModule);
      return false;
    }

    const moduleData = currentModule as Record<string, unknown>;

    if (typeof moduleData.id !== 'number') {
      console.error(`Module ${i} id is not a number:`, moduleData.id);
      return false;
    }

    if (!moduleData.title || typeof moduleData.title !== 'string') {
      console.error(`Module ${i} title is missing or invalid:`, moduleData.title);
      return false;
    }

    if (!Array.isArray(moduleData.lessons)) {
      console.error(`Module ${i} lessons is not an array:`, moduleData.lessons);
      return false;
    }

    // Validate each lesson
    for (let j = 0; j < moduleData.lessons.length; j++) {
      const lesson = moduleData.lessons[j];
      if (!lesson || typeof lesson !== 'object') {
        console.error(`Module ${i}, Lesson ${j} is not an object:`, lesson);
        return false;
      }

      const lessonData = lesson as Record<string, unknown>;

      if (!lessonData.title || typeof lessonData.title !== 'string') {
        console.error(`Module ${i}, Lesson ${j} title is missing or invalid:`, lessonData.title);
        return false;
      }
    }
  }

  return true;
}

// Function to clean old curriculum data
export function cleanOldCurriculumData(): void {
  if (typeof window !== 'undefined') {
    // Remove old curriculum data
    sessionStorage.removeItem('generatedCurriculum');
    
    // Remove all progress data (they start with 'progress_')
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('progress_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('Cleaned old curriculum and progress data');
  }
}

// Function to safely get curriculum from sessionStorage
export function getCurriculumFromStorage(): Curriculum | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedCurriculum = sessionStorage.getItem('generatedCurriculum');
    if (!savedCurriculum) return null;
    
    const parsedData = JSON.parse(savedCurriculum);
    
    if (validateCurriculumStructure(parsedData)) {
      return parsedData as Curriculum;
    } else {
      console.error('Invalid curriculum structure detected, cleaning storage');
      cleanOldCurriculumData();
      return null;
    }
  } catch (error) {
    console.error('Error parsing curriculum from storage:', error);
    cleanOldCurriculumData();
    return null;
  }
}
