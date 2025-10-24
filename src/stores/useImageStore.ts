import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ImageState {
  // 상태
  file: File | null;
  dataUrl: string | null;
  width: number;
  height: number;
  name: string;
  size: number;

  // 액션
  setImage: (file: File) => Promise<void>;
  clearImage: () => void;

  // 계산된 값 (메서드)
  isValid: () => boolean;
  isTooLarge: () => boolean;
}

export const useImageStore = create<ImageState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      file: null,
      dataUrl: null,
      width: 0,
      height: 0,
      name: '',
      size: 0,

      // 액션
      setImage: async (file: File) => {
        // File을 Data URL로 변환
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        // 이미지 크기 확인
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = dataUrl;
        });

        set({
          file,
          dataUrl,
          width: img.width,
          height: img.height,
          name: file.name,
          size: file.size,
        });
      },

      clearImage: () => {
        set({
          file: null,
          dataUrl: null,
          width: 0,
          height: 0,
          name: '',
          size: 0,
        });
      },

      // 계산된 값 (메서드)
      isValid: () => {
        const { file, width, height } = get();
        return (
          file !== null &&
          width > 100 &&
          height > 100 &&
          width <= 2000 &&
          height <= 2000
        );
      },

      isTooLarge: () => {
        const { size } = get();
        return size > 5 * 1024 * 1024; // 5MB
      },
    }),
    { name: 'ImageStore' }
  )
);
