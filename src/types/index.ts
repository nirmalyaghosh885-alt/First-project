export interface UserProfile {
  name: string;
  readinessScore: number;
  streak: number;
  level: number;
}

export interface WorkoutSession {
  id: string;
  name: string;
  exercises: Exercise[];
  totalTime: number;
  intensity: 'Low' | 'Medium' | 'High';
}

export interface Exercise {
  id: string;
  name: string;
  reps: number;
  sets: number;
  targetSkeleton?: string; // Reference to ideal form
}

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface DetectionResult {
  landmarks: PoseLandmark[];
  isCorrect: boolean;
  feedback: string;
}

export interface PropItem {
  id: string;
  name: string;
  category: string;
  estimatedWeight: number; // in kg
  bestFor: string[];
}
