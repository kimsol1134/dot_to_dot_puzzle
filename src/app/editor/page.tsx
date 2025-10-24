'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useImageStore } from '@/stores/useImageStore';
import { usePuzzleStore } from '@/stores/usePuzzleStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ControlPanel from '@/components/editor/ControlPanel';
import PuzzleCanvas from '@/components/preview/PuzzleCanvas';
import DownloadButton from '@/components/preview/DownloadButton';

export default function EditorPage() {
  const router = useRouter();
  const { dataUrl, name, width, height, size, clearImage } = useImageStore();
  const { points } = usePuzzleStore();

  // 이미지가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!dataUrl) {
      router.push('/');
    }
  }, [dataUrl, router]);

  if (!dataUrl) {
    return null;
  }

  const handleBackToHome = () => {
    clearImage();
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="outline" onClick={handleBackToHome} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          다른 이미지 선택
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Control Panel */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">퍼즐 설정</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">파일명:</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">크기:</span>
                <span className="font-medium">
                  {width} × {height}px
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">용량:</span>
                <span className="font-medium">
                  {(size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>

            {/* Control Panel */}
            <ControlPanel />
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          {/* Original Image */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">원본 이미지</h2>
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt="Uploaded"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <p className="text-muted-foreground">이미지가 없습니다</p>
              )}
            </div>
          </Card>

          {/* Puzzle Preview (shown after generation) */}
          {points.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">퍼즐 미리보기</h2>
              <PuzzleCanvas />
              <div className="mt-4">
                <DownloadButton />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
