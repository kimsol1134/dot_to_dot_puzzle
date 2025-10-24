'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useImageStore } from '@/stores/useImageStore';

export default function ImageUploader() {
  const router = useRouter();
  const { setImage } = useImageStore();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    // 파일 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있어요.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 해요.');
      return;
    }

    try {
      setError(null);
      await setImage(file);

      // Preserve query parameters (e.g., ?e2e-test-mode=true for tests)
      const searchParams = typeof window !== 'undefined' ? window.location.search : '';
      router.push(`/editor${searchParams}`);
    } catch (err) {
      setError('이미지를 불러올 수 없어요.');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          border-2 border-dashed rounded-xl p-16
          text-center cursor-pointer transition-all
          ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border hover:border-primary/50'
          }
        `}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="text-8xl">📷</div>

          {isDragging ? (
            <p className="text-xl font-medium">여기에 놓으세요!</p>
          ) : (
            <>
              <p className="text-xl font-medium">
                사진을 드래그하거나 클릭하여 선택하세요
              </p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG 파일 지원 (최대 5MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
