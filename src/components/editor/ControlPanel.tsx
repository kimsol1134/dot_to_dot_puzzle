/**
 * Control Panel Component
 *
 * Provides UI controls for puzzle generation:
 * - Difficulty slider (0-100)
 * - Start position toggle (top-left, top-right, center)
 * - Generate button with progress indicator
 * - Warning for iOS Safari (main-thread fallback)
 * - Error display
 */

'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePuzzleStore } from '@/stores/usePuzzleStore';
import { useImageStore } from '@/stores/useImageStore';
import { usePuzzleGeneration } from '@/hooks/usePuzzleGeneration';

export default function ControlPanel() {
  const { dataUrl } = useImageStore();
  const {
    difficulty,
    startPosition,
    isGenerating,
    progress,
    error,
    setDifficulty,
    setStartPosition,
  } = usePuzzleStore();

  const { generatePuzzle, strategy, showWarning } = usePuzzleGeneration();

  const handleGenerate = async () => {
    if (!dataUrl) return;

    // Automatically uses Worker or main-thread based on browser capability
    await generatePuzzle(dataUrl, {
      difficulty,
      startPosition,
    });
  };

  // Estimate number of points based on difficulty
  const estimatedPoints = Math.round(10 + (difficulty / 100) * 90);

  return (
    <div className="space-y-6">
      {/* iOS Safari Warning */}
      {showWarning && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-sm text-yellow-800">
            ⚠️ 이 브라우저에서는 퍼즐 생성 시 화면이 잠시 멈출 수 있습니다.
            <br />
            최신 Safari (16.4+) 또는 Chrome을 권장합니다.
          </AlertDescription>
        </Alert>
      )}

      {/* Difficulty Slider */}
      <div>
        <label className="block text-sm font-medium mb-2">
          난이도 조절
          <span className="ml-2 text-gray-500">(약 {estimatedPoints}개의 점)</span>
        </label>

        <Slider
          value={[difficulty]}
          onValueChange={([value]) => setDifficulty(value)}
          min={0}
          max={100}
          step={1}
          disabled={isGenerating}
          className="mb-2"
        />

        <div className="flex justify-between text-xs text-gray-500">
          <span>쉬움</span>
          <span>어려움</span>
        </div>
      </div>

      {/* Start Position Toggle */}
      <div>
        <label className="block text-sm font-medium mb-2">시작 위치</label>

        <div className="flex gap-2">
          {(['top-left', 'top-right', 'center'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setStartPosition(pos)}
              disabled={isGenerating}
              className={`
                flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium
                transition-colors
                ${startPosition === pos
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {pos === 'top-left' && '왼쪽 위'}
              {pos === 'top-right' && '오른쪽 위'}
              {pos === 'center' && '가운데'}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !dataUrl}
        className="w-full"
        size="lg"
      >
        {isGenerating ? `처리 중... ${progress}%` : '🎨 퍼즐 만들기!'}
      </Button>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
