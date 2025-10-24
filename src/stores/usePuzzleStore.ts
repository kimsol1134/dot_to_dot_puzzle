import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Point {
  x: number;
  y: number;
  number: number;
}

interface PuzzleState {
  // 설정
  difficulty: number; // 0-100
  startPosition: 'top-left' | 'top-right' | 'center';

  // 생성된 데이터
  points: Point[];
  originalSize: { width: number; height: number };

  // 상태
  isGenerating: boolean;
  progress: number; // 0-100
  error: string | null;

  // 액션
  setDifficulty: (difficulty: number) => void;
  setStartPosition: (position: 'top-left' | 'top-right' | 'center') => void;
  setPoints: (points: Point[], originalSize: { width: number; height: number }) => void;
  setGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePuzzleStore = create<PuzzleState>()(
  devtools(
    (set) => ({
      // 초기 상태
      difficulty: 50,
      startPosition: 'top-left',
      points: [],
      originalSize: { width: 0, height: 0 },
      isGenerating: false,
      progress: 0,
      error: null,

      // 액션
      setDifficulty: (difficulty) => set({ difficulty }),
      setStartPosition: (startPosition) => set({ startPosition }),
      setPoints: (points, originalSize) => set({ points, originalSize }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setProgress: (progress) => set({ progress }),
      setError: (error) => set({ error }),
      reset: () =>
        set({
          points: [],
          isGenerating: false,
          progress: 0,
          error: null,
        }),
    }),
    { name: 'PuzzleStore' }
  )
);
