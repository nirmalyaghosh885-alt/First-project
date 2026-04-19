import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let poseLandmarker: PoseLandmarker | null = null;

export async function initPoseDetection() {
  if (poseLandmarker) return poseLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numPoses: 1
  });

  return poseLandmarker;
}

// Logic to check form (Simplified for demo)
export function checkSquatForm(landmarks: any): { isCorrect: boolean; feedback: string } {
  // Landmarks indices for MediaPipe:
  // 11, 12: shoulders
  // 23, 24: hips
  // 25, 26: knees
  // 27, 28: ankles
  
  if (!landmarks || landmarks.length < 33) return { isCorrect: true, feedback: "Keep going" };

  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];

  // A very simple vertical alignment check or depth check
  const kneeToHipY = Math.abs(leftHip.y - leftKnee.y);
  const kneeToAnkleY = Math.abs(leftKnee.y - leftAnkle.y);

  if (kneeToHipY < 0.1 && kneeToAnkleY > 0.1) {
    return { isCorrect: true, feedback: "Perfect Depth!" };
  }
  
  if (leftKnee.x < leftAnkle.x - 0.05) {
    return { isCorrect: false, feedback: "Knees inward! Push them out." };
  }

  return { isCorrect: true, feedback: "Maintain core tension" };
}
