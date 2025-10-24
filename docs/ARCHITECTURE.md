
# 점잇기 퍼즐 생성기 - 기술 아키텍처 문서

**문서 버전**: 2.0 (클라이언트 사이드)  
**작성일**: 2025년 10월 23일  
**대상 독자**: 개발팀

---

## 목차

1. [시스템 개요](#1-시스템-개요)
2. [기술 스택](#2-기술-스택)
3. [시스템 아키텍처](#3-시스템-아키텍처)
4. [프론트엔드 아키텍처](#4-프론트엔드-아키텍처)
5. [이미지 처리 알고리즘](#5-이미지-처리-알고리즘)
6. [데이터 모델](#6-데이터-모델)
7. [성능 최적화](#7-성능-최적화)
8. [배포 전략](#8-배포-전략)
9. [테스트 전략](#9-테스트-전략)

---

## 1. 시스템 개요

### 1.1. 아키텍처 원칙

**완전 클라이언트 사이드 처리**
- 모든 이미지 처리가 사용자 브라우저에서 실행
- 서버로 이미지 전송 없음 (프라이버시 보장)
- 서버는 정적 파일만 제공 (Next.js + Vercel)

**주요 특징**
- 🚀 빠른 처리 (네트워크 왕복 없음)
- 💰 무료 운영 (서버 비용 0)
- 🔒 프라이버시 (이미지가 서버에 저장 안됨)
- 📱 확장 가능 (CDN을 통한 무한 확장)

### 1.2. 시스템 구성도

```
┌─────────────────────────────────────────────┐
│          사용자 브라우저                      │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Next.js 15 클라이언트 애플리케이션    │ │
│  │  (React 19, Turbopack)               │ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │  React Components (메인 스레드)  │ │ │
│  │  │  - ImageUploader                │ │ │
│  │  │  - EditorPanel                  │ │ │
│  │  │  - PuzzlePreview                │ │ │
│  │  │  - DownloadButton               │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │            ↕ postMessage             │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │  Web Worker (별도 스레드)        │ │ │
│  │  │  - OffscreenCanvas              │ │ │
│  │  │  - Canny 엣지 검출              │ │ │
│  │  │  - 윤곽선 추출                   │ │ │
│  │  │  - 점 배치 알고리즘              │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │  상태 관리 (Zustand)            │ │ │
│  │  │  - imageStore                   │ │ │
│  │  │  - puzzleStore                  │ │ │
│  │  └─────────────────────────────────┘ │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
                    │
                    │ HTTPS
                    ▼
        ┌───────────────────────┐
        │   Vercel Edge Network │
        │   (정적 파일 CDN)      │
        │                       │
        │   - HTML/CSS/JS       │
        │   - 이미지/폰트        │
        │   - 서버 로직 없음     │
        └───────────────────────┘
```

---

## 2. 기술 스택

### 2.1. 코어 프레임워크

```yaml
Framework:
  - Next.js: 15.x (App Router, Turbopack)
  - React: 19.x
  - TypeScript: 5.7.x

Styling:
  - Tailwind CSS: 4.x
  - shadcn/ui: latest
  - Radix UI: latest

State Management:
  - Zustand: 4.5.x

Build Tools:
  - Turbopack: (Next.js 15 기본)
  - PostCSS: 8.4.0
```

### 2.2. 이미지 처리

```yaml
Native Browser APIs:
  - Canvas API: 이미지 그리기 및 픽셀 조작
  - ImageData API: 픽셀 데이터 직접 접근
  - File API: 파일 읽기
  - Blob API: 파일 다운로드

Worker APIs (with fallback):
  - OffscreenCanvas: Worker에서 Canvas 사용 (폴백: 메인 스레드)
  - createImageBitmap: Worker에서 이미지 로드 (폴백: 메인 스레드)

Optional Libraries (Phase 2):
  - jsPDF: 2.5.0 (PDF 생성)
  - file-saver: 2.0.5 (파일 다운로드 헬퍼)
```

**⚠️ 브라우저 호환성 리스크**:
- iOS Safari 15.x 이하: Worker에서 OffscreenCanvas 미지원
- Safari 16.0-16.3: createImageBitmap 부분 지원
- **영향**: iPad/iPhone 사용자 (주 타겟층) 생성 실패 가능

**해결 전략**:
- Feature detection으로 지원 여부 확인
- 미지원 시 메인 스레드 폴백 (UI는 느려도 동작은 보장)
- 성능 저하 경고 메시지 표시

### 2.3. 프레임워크 스택 리스크 및 완화

**⚠️ Next.js 15/React 19 사용 리스크**:

```yaml
리스크:
  - Next.js 15: RC 단계, 프로덕션 안정성 미검증
  - React 19: shadcn/ui, Radix UI 일부 호환성 이슈 가능
  - Tailwind 4: Beta, 플러그인 생태계 미성숙
  - Turbopack: Webpack 대비 플러그인 제한

일정 영향:
  - 호환성 디버깅: 예상 1-3일 추가 소요 가능
  - 의존성 버전 충돌: shadcn/ui 설치 실패 가능
```

**완화 전략**:

1. **즉시 롤백 준비**
   ```bash
   # 문제 발생 시 즉시 Next.js 14로 롤백
   pnpm install next@14.2.15 react@18.3.1 react-dom@18.3.1
   ```

2. **UI 라이브러리 대안**
   - shadcn/ui 실패 시 → Headless UI + Tailwind 직접 스타일링
   - 컴포넌트 3개만 필요: Button, Slider, Card

3. **단계적 검증**
   - Day 1: 프로젝트 생성 후 즉시 빌드 테스트
   - 빌드 실패 시 즉시 Next.js 14로 마이그레이션
   - shadcn/ui 설치 실패 시 대안 UI 사용

4. **최대 리스크 허용 시간**
   - Day 1 종료 시점까지 환경 구축 완료 필수
   - 문제 지속 시 Day 2부터 Next.js 14로 작업

### 2.4. 개발 도구

```yaml
Code Quality:
  - ESLint: 8.0.0
  - Prettier: 3.0.0
  - TypeScript: 5.3.0

Testing:
  - Vitest: 1.0.0 (단위 테스트)
  - Playwright: 1.40.0 (E2E 테스트)

Development:
  - pnpm: 8.0.0 (패키지 관리)
  - Git: 버전 관리
```

### 2.4. 배포 및 모니터링

```yaml
Hosting:
  - Vercel: Edge Network 배포

Analytics:
  - Vercel Analytics: 성능 모니터링
  - Google Analytics 4: 사용자 행동 분석 (선택)

Error Tracking:
  - Sentry: 에러 추적 (선택)
```

---

## 3. 시스템 아키텍처

### 3.1. 데이터 흐름

```
[사용자] → [이미지 선택] → [File 객체]
                                  │
                                  ▼
                        [FileReader API]
                                  │
                                  ▼
                        [Image 객체 생성]
                                  │
                                  ▼
                        [Canvas에 그리기]
                                  │
                                  ▼
                        [ImageData 추출]
                                  │
                ┌─────────────────┴─────────────────┐
                ▼                                   ▼
        [그레이스케일 변환]                [크기 조정]
                │                                   │
                └─────────────────┬─────────────────┘
                                  ▼
                        [엣지 검출 (Sobel)]
                                  │
                                  ▼
                        [이진화 (Threshold)]
                                  │
                                  ▼
                        [윤곽선 추출]
                                  │
                                  ▼
                [Douglas-Peucker 알고리즘]
                                  │
                                  ▼
                        [점 필터링 (최소 거리)]
                                  │
                                  ▼
                        [번호 매기기]
                                  │
                                  ▼
                        [점 데이터 배열]
                                  │
                ┌─────────────────┴─────────────────┐
                ▼                                   ▼
        [Canvas 미리보기]                    [PNG 생성]
                                                  │
                                                  ▼
                                            [다운로드]
```

### 3.2. 컴포넌트 계층 구조

```
App Layout
└── HomePage (/)
    └── ImageUploader
        └── DropZone

App Layout
└── EditorPage (/editor)
    ├── OriginalImagePanel
    │   ├── ImagePreview
    │   └── ChangeImageButton
    ├── ControlPanel
    │   ├── DifficultySlider
    │   ├── StartPositionSelector
    │   └── GenerateButton
    └── ResultPanel
        ├── LoadingSpinner
        ├── PuzzlePreview (Canvas)
        └── DownloadButton
```

---

## 4. 프론트엔드 아키텍처

### 4.1. 프로젝트 구조

```
connect-the-dots/
├── app/                                # Next.js 15 App Router
│   ├── layout.tsx                      # 루트 레이아웃
│   ├── page.tsx                        # 홈페이지 (업로드)
│   ├── editor/
│   │   └── page.tsx                    # 편집 페이지
│   ├── guides/
│   │   └── page.tsx                    # 가이드 페이지
│   └── globals.css                     # 전역 스타일
│
├── components/                         # React 컴포넌트
│   ├── ui/                            # shadcn/ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── slider.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── upload/
│   │   ├── ImageUploader.tsx
│   │   ├── DropZone.tsx
│   │   └── ImagePreview.tsx
│   ├── editor/
│   │   ├── ControlPanel.tsx
│   │   ├── DifficultySlider.tsx
│   │   ├── StartPositionSelector.tsx
│   │   └── GenerateButton.tsx
│   ├── preview/
│   │   ├── PuzzleCanvas.tsx
│   │   └── DownloadButton.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       └── ErrorMessage.tsx
│
├── lib/                               # 핵심 로직
│   ├── image-processing/              # 이미지 처리 엔진 (Worker 전용)
│   │   ├── index.ts                   # 메인 진입점
│   │   ├── canvas-utils.ts            # Canvas 유틸리티
│   │   ├── grayscale.ts               # 그레이스케일 변환
│   │   ├── edge-detection.ts          # Canny 엣지 검출
│   │   ├── contour-extraction.ts      # 윤곽선 추출
│   │   ├── point-placement.ts         # 점 배치
│   │   ├── numbering.ts               # 번호 매기기
│   │   └── douglas-peucker.ts         # DP 알고리즘
│   │
│   ├── output/                        # 출력 생성
│   │   ├── png-generator.ts           # PNG 생성
│   │   └── pdf-generator.ts           # PDF 생성 (Phase 2)
│   │
│   └── utils/                         # 유틸리티
│       ├── validation.ts              # 파일 검증
│       ├── geometry.ts                # 기하학 계산
│       └── constants.ts               # 상수
│
├── workers/                           # Web Workers (MVP 필수)
│   └── image-processor.worker.ts      # 이미지 처리 Worker
│
├── stores/                            # Zustand 상태 관리
│   ├── useImageStore.ts               # 이미지 상태
│   ├── usePuzzleStore.ts              # 퍼즐 상태
│   └── useUIStore.ts                  # UI 상태
│
├── types/                             # TypeScript 타입
│   ├── image.ts
│   ├── puzzle.ts
│   └── index.ts
│
└── hooks/                             # 커스텀 훅
    ├── useImageUpload.ts
    ├── usePuzzleGeneration.ts         # Worker 통신 래퍼
    └── useDownload.ts
│
├── public/                            # 정적 파일
│   ├── examples/                      # 예시 이미지
│   ├── icons/
│   └── fonts/
│
├── tests/                             # 테스트
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

### 4.2. Zustand 상태 관리

#### 4.2.1. Image Store

```typescript
// stores/useImageStore.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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
  
  // 계산된 값
  isValid: boolean;
  isTooLarge: boolean;
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
      
      // 계산된 값
      get isValid() {
        const { file, width, height } = get();
        return (
          file !== null &&
          width > 100 &&
          height > 100 &&
          width <= 2000 &&
          height <= 2000
        );
      },
      
      get isTooLarge() {
        const { size } = get();
        return size > 5 * 1024 * 1024; // 5MB
      },
    }),
    { name: 'ImageStore' }
  )
);
```

#### 4.2.2. Puzzle Store

```typescript
// stores/usePuzzleStore.ts

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
      reset: () => set({
        points: [],
        isGenerating: false,
        progress: 0,
        error: null,
      }),
    }),
    { name: 'PuzzleStore' }
  )
);
```

### 4.3. 주요 컴포넌트

#### 4.3.1. ImageUploader

```typescript
// components/upload/ImageUploader.tsx

'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useImageStore } from '@/stores/useImageStore';
import { useDropzone } from 'react-dropzone';

export default function ImageUploader() {
  const router = useRouter();
  const { setImage, isTooLarge } = useImageStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      await setImage(file);
      router.push('/editor');
    } catch (error) {
      console.error('이미지 로드 실패:', error);
    }
  }, [setImage, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-16 
        text-center cursor-pointer transition-all
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50 scale-105' 
          : 'border-gray-300 hover:border-gray-400'
        }
      `}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        <div className="text-8xl">📷</div>
        
        {isDragActive ? (
          <p className="text-xl font-medium">여기에 놓으세요!</p>
        ) : (
          <>
            <p className="text-xl font-medium">
              사진을 드래그하거나 클릭하여 선택하세요
            </p>
            <p className="text-sm text-gray-500">
              JPG, PNG 파일 지원 (최대 5MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
```

#### 4.3.2. PuzzleCanvas

```typescript
// components/preview/PuzzleCanvas.tsx

'use client';

import { useEffect, useRef } from 'react';
import { usePuzzleStore } from '@/stores/usePuzzleStore';

interface Point {
  x: number;
  y: number;
  number: number;
}

export default function PuzzleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { points, originalSize } = usePuzzleStore();

  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // A4 비율 (210mm x 297mm ≈ 1:1.414)
    const canvasWidth = 600;
    const canvasHeight = 848;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 배경 흰색
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 스케일 계산 (여백 포함)
    const margin = 50;
    const availableWidth = canvasWidth - 2 * margin;
    const availableHeight = canvasHeight - 2 * margin;
    
    const scale = Math.min(
      availableWidth / originalSize.width,
      availableHeight / originalSize.height
    );

    // 중앙 정렬을 위한 오프셋
    const scaledWidth = originalSize.width * scale;
    const scaledHeight = originalSize.height * scale;
    const offsetX = (canvasWidth - scaledWidth) / 2;
    const offsetY = (canvasHeight - scaledHeight) / 2;

    // 점 그리기
    points.forEach((point) => {
      const x = point.x * scale + offsetX;
      const y = point.y * scale + offsetY;

      // 점 (원)
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // 번호
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(point.number.toString(), x + 8, y - 5);

      // 1번 점은 빨간 원으로 강조
      if (point.number === 1) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

  }, [points, originalSize]);

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
      <canvas ref={canvasRef} className="w-full h-auto" />
    </div>
  );
}
```

---

## 5. 이미지 처리 알고리즘

### 5.1. 메인 파이프라인

> ⚠️ **중요**: 아래 코드는 **Web Worker 내부에서 실행**됩니다.
> DOM API를 사용할 수 없으므로 OffscreenCanvas와 ImageBitmap을 사용합니다.

```typescript
// lib/image-processing/index.ts (Web Worker 전용)

import { grayscaleConversion } from './grayscale';
import { cannyEdgeDetection } from './edge-detection';
import { extractContours } from './contour-extraction';
import { placePoints } from './point-placement';
import { assignNumbers } from './numbering';

export interface ProcessingOptions {
  difficulty: number; // 0-100
  startPosition: 'top-left' | 'top-right' | 'center';
  onProgress?: (progress: number, message: string) => void;
}

export interface Point {
  x: number;
  y: number;
  number: number;
}

export async function processImageToPuzzle(
  imageDataUrl: string,
  options: ProcessingOptions
): Promise<{ points: Point[]; originalSize: { width: number; height: number } }> {
  const { difficulty, startPosition, onProgress } = options;

  // 1. 이미지 로드 (Worker 환경에서 ImageBitmap 사용)
  onProgress?.(10, '이미지 로드 중...');
  const img = await loadImageInWorker(imageDataUrl);
  const originalSize = { width: img.width, height: img.height };

  // 2. OffscreenCanvas에 그리기
  onProgress?.(20, '이미지 준비 중...');

  // 크기 제한 (성능 최적화)
  const maxSize = 1000;
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));

  const canvas = new OffscreenCanvas(
    Math.floor(img.width * scale),
    Math.floor(img.height * scale)
  );
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // 3. 그레이스케일 변환
  onProgress?.(30, '이미지 분석 중...');
  const grayData = grayscaleConversion(imageData);

  // 4. Canny 엣지 검출
  onProgress?.(50, '윤곽 찾는 중...');
  const edgeData = cannyEdgeDetection(grayData);

  // 5. 윤곽선 추출 (가장 큰 윤곽선 1개만)
  onProgress?.(60, '선 추출 중...');
  const contours = extractContours(edgeData);

  // 6. 점 배치 (Douglas-Peucker 간소화)
  onProgress?.(70, '점 배치 중...');
  const rawPoints = placePoints(contours, difficulty);

  // 7. 번호 매기기 (배열 회전으로 시작점 설정)
  onProgress?.(90, '번호 매기는 중...');
  const points = assignNumbers(rawPoints, startPosition);

  onProgress?.(100, '완료!');

  // 원본 크기로 좌표 스케일 복원
  const scaledPoints = points.map(p => ({
    ...p,
    x: p.x / scale,
    y: p.y / scale,
  }));

  return { points: scaledPoints, originalSize };
}

// Worker 환경에서 이미지 로드 (ImageBitmap 사용)
function loadImageInWorker(dataUrl: string): Promise<ImageBitmap> {
  return fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => createImageBitmap(blob));
}
```

### 5.2. 그레이스케일 변환

```typescript
// lib/image-processing/grayscale.ts

export function grayscaleConversion(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  const grayData = new ImageData(width, height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Luminosity 방법 (인간 시각에 최적화)
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    grayData.data[i] = gray;
    grayData.data[i + 1] = gray;
    grayData.data[i + 2] = gray;
    grayData.data[i + 3] = 255; // 알파 채널
  }

  return grayData;
}
```

### 5.3. Canny 엣지 검출

**중요**: Sobel 필터 대신 Canny 엣지 검출을 사용합니다. Sobel은 눈, 코, 입 등 **모든 내부 디테일**을 검출하여 4살 아이용 퍼즐에는 부적합합니다. Canny는 노이즈를 제거하고 **주요 외곽선만** 강조합니다.

```typescript
// lib/image-processing/edge-detection.ts

export function cannyEdgeDetection(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;

  // 1. Gaussian Blur (노이즈 제거)
  const blurred = gaussianBlur(imageData, 1.4);

  // 2. Sobel 그라디언트 계산
  const { magnitude, direction } = computeGradient(blurred);

  // 3. Non-maximum Suppression (가장 강한 엣지만 남김)
  const suppressed = nonMaxSuppression(magnitude, direction, width, height);

  // 4. Double Threshold (강한 엣지 / 약한 엣지 구분)
  const thresholded = doubleThreshold(suppressed, width, height, 50, 100);

  // 5. Edge Tracking by Hysteresis (연결된 엣지만 유지)
  const edges = edgeTrackingHysteresis(thresholded, width, height);

  return edges;
}

function gaussianBlur(imageData: ImageData, sigma: number): ImageData {
  // 5x5 Gaussian 커널
  const { data, width, height } = imageData;
  const blurred = new ImageData(width, height);

  const kernel = [
    [2, 4, 5, 4, 2],
    [4, 9, 12, 9, 4],
    [5, 12, 15, 12, 5],
    [4, 9, 12, 9, 4],
    [2, 4, 5, 4, 2],
  ];

  const kernelSum = 159;

  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      let sum = 0;

      for (let ky = 0; ky < 5; ky++) {
        for (let kx = 0; kx < 5; kx++) {
          const pixelIndex = ((y + ky - 2) * width + (x + kx - 2)) * 4;
          sum += data[pixelIndex] * kernel[ky][kx];
        }
      }

      const blurredValue = sum / kernelSum;
      const index = (y * width + x) * 4;
      blurred.data[index] = blurredValue;
      blurred.data[index + 1] = blurredValue;
      blurred.data[index + 2] = blurredValue;
      blurred.data[index + 3] = 255;
    }
  }

  return blurred;
}

function computeGradient(imageData: ImageData): {
  magnitude: Float32Array;
  direction: Float32Array;
} {
  const { data, width, height } = imageData;
  const magnitude = new Float32Array(width * height);
  const direction = new Float32Array(width * height);

  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
          const gray = data[pixelIndex];
          const kernelIndex = (ky + 1) * 3 + (kx + 1);

          gx += gray * sobelX[kernelIndex];
          gy += gray * sobelY[kernelIndex];
        }
      }

      const index = y * width + x;
      magnitude[index] = Math.sqrt(gx * gx + gy * gy);
      direction[index] = Math.atan2(gy, gx);
    }
  }

  return { magnitude, direction };
}

function nonMaxSuppression(
  magnitude: Float32Array,
  direction: Float32Array,
  width: number,
  height: number
): Float32Array {
  const result = new Float32Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = y * width + x;
      const angle = direction[index];
      const mag = magnitude[index];

      // 그라디언트 방향에 따라 이웃 픽셀 선택
      let neighbor1, neighbor2;

      if ((angle >= -Math.PI / 8 && angle < Math.PI / 8) ||
          (angle >= 7 * Math.PI / 8 || angle < -7 * Math.PI / 8)) {
        neighbor1 = magnitude[index - 1];
        neighbor2 = magnitude[index + 1];
      } else if (angle >= Math.PI / 8 && angle < 3 * Math.PI / 8) {
        neighbor1 = magnitude[index - width + 1];
        neighbor2 = magnitude[index + width - 1];
      } else if (angle >= 3 * Math.PI / 8 && angle < 5 * Math.PI / 8) {
        neighbor1 = magnitude[index - width];
        neighbor2 = magnitude[index + width];
      } else {
        neighbor1 = magnitude[index - width - 1];
        neighbor2 = magnitude[index + width + 1];
      }

      // 최대값이면 유지, 아니면 제거
      if (mag >= neighbor1 && mag >= neighbor2) {
        result[index] = mag;
      } else {
        result[index] = 0;
      }
    }
  }

  return result;
}

function doubleThreshold(
  magnitude: Float32Array,
  width: number,
  height: number,
  lowThreshold: number,
  highThreshold: number
): Uint8Array {
  const result = new Uint8Array(width * height);

  for (let i = 0; i < magnitude.length; i++) {
    const mag = magnitude[i];

    if (mag >= highThreshold) {
      result[i] = 2; // 강한 엣지
    } else if (mag >= lowThreshold) {
      result[i] = 1; // 약한 엣지
    } else {
      result[i] = 0; // 엣지 아님
    }
  }

  return result;
}

function edgeTrackingHysteresis(
  thresholded: Uint8Array,
  width: number,
  height: number
): ImageData {
  const result = new ImageData(width, height);
  const visited = new Uint8Array(width * height);

  // 강한 엣지부터 시작하여 연결된 약한 엣지 추적
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = y * width + x;

      if (thresholded[index] === 2 && visited[index] === 0) {
        // 강한 엣지부터 DFS로 연결된 약한 엣지 찾기
        traceEdge(thresholded, visited, result.data, x, y, width, height);
      }
    }
  }

  return result;
}

function traceEdge(
  thresholded: Uint8Array,
  visited: Uint8Array,
  output: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const stack: Array<{ x: number; y: number }> = [{ x, y }];

  while (stack.length > 0) {
    const { x: cx, y: cy } = stack.pop()!;
    const index = cy * width + cx;

    if (cx < 0 || cx >= width || cy < 0 || cy >= height ||
        visited[index] === 1 || thresholded[index] === 0) {
      continue;
    }

    visited[index] = 1;

    // 엣지로 표시
    const pixelIndex = index * 4;
    output[pixelIndex] = 255;
    output[pixelIndex + 1] = 255;
    output[pixelIndex + 2] = 255;
    output[pixelIndex + 3] = 255;

    // 8방향 이웃 탐색
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        stack.push({ x: cx + dx, y: cy + dy });
      }
    }
  }
}
```

### 5.4. 윤곽선 추출

**중요**: 모든 윤곽선을 추출하지 않고, **가장 큰 윤곽선 1개만** 선택합니다. 이것이 캐릭터의 주 외곽선일 확률이 높습니다. 여러 개를 사용하면 내부 디테일(눈, 코 등)까지 점으로 변환되어 퍼즐이 복잡해집니다.

```typescript
// lib/image-processing/contour-extraction.ts

export interface Contour {
  points: Array<{ x: number; y: number }>;
  length: number; // 윤곽선의 총 길이 (점의 개수)
}

export function extractContours(edgeData: ImageData): Contour[] {
  const { data, width, height } = edgeData;

  // 1. 이진화 (Canny 결과는 이미 이진화됨)
  const binaryData = new Uint8Array(width * height);

  for (let i = 0; i < data.length; i += 4) {
    binaryData[i / 4] = data[i] > 128 ? 1 : 0;
  }

  // 2. 연결된 컴포넌트 찾기
  const visited = new Uint8Array(width * height);
  const contours: Contour[] = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = y * width + x;

      if (binaryData[index] === 1 && visited[index] === 0) {
        const contour = traceContour(binaryData, visited, width, height, x, y);

        // 최소 크기 필터링 (너무 작은 노이즈 제외)
        if (contour.points.length > 50) {
          contours.push(contour);
        }
      }
    }
  }

  // 3. 길이 순으로 정렬 (긴 것부터)
  contours.sort((a, b) => b.length - a.length);

  // ⭐ 핵심: 가장 긴 윤곽선 1개만 반환
  // 이것이 캐릭터의 주 외곽선입니다.
  return contours.length > 0 ? [contours[0]] : [];
}

function traceContour(
  binaryData: Uint8Array,
  visited: Uint8Array,
  width: number,
  height: number,
  startX: number,
  startY: number
): Contour {
  const points: Array<{ x: number; y: number }> = [];

  // 윤곽선을 시계 방향으로 추적 (순서 보존)
  let x = startX;
  let y = startY;
  let direction = 0; // 시작 방향 (동쪽)

  const directions = [
    { dx: 1, dy: 0 },   // 동
    { dx: 1, dy: 1 },   // 남동
    { dx: 0, dy: 1 },   // 남
    { dx: -1, dy: 1 },  // 남서
    { dx: -1, dy: 0 },  // 서
    { dx: -1, dy: -1 }, // 북서
    { dx: 0, dy: -1 },  // 북
    { dx: 1, dy: -1 },  // 북동
  ];

  const maxIterations = width * height; // 무한 루프 방지
  let iterations = 0;

  do {
    const index = y * width + x;
    visited[index] = 1;
    points.push({ x, y });

    // 다음 경계점 찾기 (시계 방향)
    let found = false;

    for (let i = 0; i < 8; i++) {
      const checkDir = (direction + 7 + i) % 8; // 반시계로 시작
      const { dx, dy } = directions[checkDir];
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIndex = ny * width + nx;

        if (binaryData[nIndex] === 1) {
          x = nx;
          y = ny;
          direction = checkDir;
          found = true;
          break;
        }
      }
    }

    if (!found) break;

    iterations++;
    if (iterations > maxIterations) break;

    // 시작점으로 돌아오면 종료
    if (points.length > 1 && x === startX && y === startY) {
      break;
    }
  } while (true);

  return { points, length: points.length };
}
```

### 5.5. Douglas-Peucker 알고리즘

```typescript
// lib/image-processing/douglas-peucker.ts

export function douglasPeucker(
  points: Array<{ x: number; y: number }>,
  epsilon: number
): Array<{ x: number; y: number }> {
  if (points.length <= 2) {
    return points;
  }

  // 첫 점과 마지막 점 사이의 선분에서 가장 먼 점 찾기
  let maxDistance = 0;
  let maxIndex = 0;

  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], start, end);
    
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // 최대 거리가 epsilon보다 크면 재귀적으로 분할
  if (maxDistance > epsilon) {
    const leftPoints = douglasPeucker(points.slice(0, maxIndex + 1), epsilon);
    const rightPoints = douglasPeucker(points.slice(maxIndex), epsilon);

    // 마지막 점 중복 제거
    return [...leftPoints.slice(0, -1), ...rightPoints];
  } else {
    // epsilon보다 작으면 첫 점과 마지막 점만 유지
    return [start, end];
  }
}

function perpendicularDistance(
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number {
  const { x: px, y: py } = point;
  const { x: x1, y: y1 } = lineStart;
  const { x: x2, y: y2 } = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  // 선분의 길이가 0이면 점까지의 거리 반환
  if (dx === 0 && dy === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  // 수직 거리 계산
  const numerator = Math.abs(dy * px - dx * py + x2 * y1 - y2 * x1);
  const denominator = Math.sqrt(dx ** 2 + dy ** 2);

  return numerator / denominator;
}
```

### 5.6. 점 배치

```typescript
// lib/image-processing/point-placement.ts

import { douglasPeucker } from './douglas-peucker';
import type { Contour } from './contour-extraction';

export interface PlacedPoint {
  x: number;
  y: number;
  contourId: number;
}

export function placePoints(
  contours: Contour[],
  difficulty: number
): PlacedPoint[] {
  // 난이도를 epsilon으로 변환
  // difficulty 0 (쉬움) → epsilon 50 (점 적음)
  // difficulty 100 (어려움) → epsilon 5 (점 많음)
  const epsilon = 50 - (difficulty / 100) * 45;

  const allPoints: PlacedPoint[] = [];

  contours.forEach((contour, contourId) => {
    // Douglas-Peucker 알고리즘으로 점 단순화
    const simplifiedPoints = douglasPeucker(contour.points, epsilon);

    // PlacedPoint로 변환
    simplifiedPoints.forEach(point => {
      allPoints.push({
        x: point.x,
        y: point.y,
        contourId,
      });
    });
  });

  // 최소 거리 제약 적용 (번호가 겹치지 않도록)
  const minDistance = 20; // 픽셀
  const filteredPoints = enforceMinDistance(allPoints, minDistance);

  return filteredPoints;
}

function enforceMinDistance(
  points: PlacedPoint[],
  minDistance: number
): PlacedPoint[] {
  if (points.length === 0) return points;

  const filtered: PlacedPoint[] = [points[0]];

  for (const point of points.slice(1)) {
    let isFarEnough = true;

    for (const existing of filtered) {
      const distance = Math.sqrt(
        (point.x - existing.x) ** 2 + (point.y - existing.y) ** 2
      );

      if (distance < minDistance) {
        isFarEnough = false;
        break;
      }
    }

    if (isFarEnough) {
      filtered.push(point);
    }
  }

  return filtered;
}
```

### 5.7. 번호 매기기

**중요**: Douglas-Peucker 알고리즘은 **원본 윤곽선의 순서를 보존**합니다. 따라서 Nearest Neighbor 방식으로 재정렬하면 안 됩니다! 시작점의 인덱스를 찾아서 배열을 회전(rotate)시키기만 하면 됩니다.

```typescript
// lib/image-processing/numbering.ts

import type { PlacedPoint } from './point-placement';

export interface NumberedPoint {
  x: number;
  y: number;
  number: number;
}

export function assignNumbers(
  points: PlacedPoint[],
  startPosition: 'top-left' | 'top-right' | 'center'
): NumberedPoint[] {
  if (points.length === 0) return [];

  // 1. 시작점의 인덱스 찾기
  const startIndex = findStartPointIndex(points, startPosition);

  // 2. 배열을 시작점부터 순환하도록 재정렬
  // [A, B, C, D, E]에서 시작점이 C(index=2)라면
  // [C, D, E, A, B]로 변환
  const reordered = [
    ...points.slice(startIndex),
    ...points.slice(0, startIndex),
  ];

  // 3. 순차적으로 번호 매기기
  return reordered.map((point, index) => ({
    x: point.x,
    y: point.y,
    number: index + 1,
  }));
}

function findStartPointIndex(
  points: PlacedPoint[],
  startPosition: 'top-left' | 'top-right' | 'center'
): number {
  if (startPosition === 'top-left') {
    // 좌상단에 가장 가까운 점의 인덱스
    return points.reduce(
      (minIdx, point, idx) =>
        point.x + point.y < points[minIdx].x + points[minIdx].y ? idx : minIdx,
      0
    );
  } else if (startPosition === 'top-right') {
    // 우상단에 가장 가까운 점의 인덱스
    const maxX = Math.max(...points.map(p => p.x));
    return points.reduce(
      (minIdx, point, idx) =>
        (maxX - point.x) + point.y < (maxX - points[minIdx].x) + points[minIdx].y
          ? idx
          : minIdx,
      0
    );
  } else {
    // 중앙에 가장 가까운 점의 인덱스
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    return points.reduce((minIdx, point, idx) => {
      const distPoint = (point.x - centerX) ** 2 + (point.y - centerY) ** 2;
      const distMin =
        (points[minIdx].x - centerX) ** 2 + (points[minIdx].y - centerY) ** 2;
      return distPoint < distMin ? idx : minIdx;
    }, 0);
  }
}
```

---

## 6. 데이터 모델

### 6.1. TypeScript 타입 정의

```typescript
// types/image.ts

export interface ImageFile {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  name: string;
  size: number;
}

export interface ImageValidation {
  isValid: boolean;
  errors: string[];
}
```

```typescript
// types/puzzle.ts

export interface PuzzlePoint {
  x: number;
  y: number;
  number: number;
}

export interface PuzzleConfig {
  difficulty: number; // 0-100
  startPosition: 'top-left' | 'top-right' | 'center';
}

export interface GeneratedPuzzle {
  points: PuzzlePoint[];
  originalSize: {
    width: number;
    height: number;
  };
  config: PuzzleConfig;
  generatedAt: Date;
}
```

---

## 7. 성능 최적화

### 7.1. 이미지 처리 최적화

**⚠️ Web Worker 사용 (MVP 필수) + iOS Safari 폴백**

Canny 엣지 검출은 5단계 처리로 **매우 무겁습니다**. 1000x1000px 이미지를 메인 스레드에서 처리하면 UI가 3~5초 이상 멉니다. F-03의 "5초 이내 미리보기" SLA를 지키려면 **Web Worker가 MVP에 필수**입니다.

**그러나** iOS Safari 15.x 이하에서 Worker의 OffscreenCanvas가 미지원되므로, 메인 스레드 폴백이 필수입니다.

**Feature Detection (브라우저 지원 감지)**

```typescript
// lib/utils/feature-detection.ts

export interface FeatureSupport {
  offscreenCanvas: boolean;
  createImageBitmap: boolean;
  webWorker: boolean;
  canUseWorkerPipeline: boolean;
}

export function detectFeatures(): FeatureSupport {
  const offscreenCanvas = typeof OffscreenCanvas !== 'undefined';
  const createImageBitmap = typeof self.createImageBitmap === 'function';
  const webWorker = typeof Worker !== 'undefined';

  return {
    offscreenCanvas,
    createImageBitmap,
    webWorker,
    // Worker 파이프라인 사용 가능 조건: 3가지 모두 지원
    canUseWorkerPipeline: offscreenCanvas && createImageBitmap && webWorker,
  };
}

export function getRecommendedStrategy(): 'worker' | 'main-thread' {
  const features = detectFeatures();

  if (features.canUseWorkerPipeline) {
    return 'worker';
  }

  // iOS Safari 등 미지원 브라우저
  console.warn('OffscreenCanvas not supported, falling back to main thread');
  return 'main-thread';
}
```

**Worker 구현 (OffscreenCanvas 사용)**

```typescript
// workers/image-processor.worker.ts

import { grayscaleConversion } from '../lib/image-processing/grayscale';
import { cannyEdgeDetection } from '../lib/image-processing/edge-detection';
import { extractContours } from '../lib/image-processing/contour-extraction';
import { placePoints } from '../lib/image-processing/point-placement';
import { assignNumbers } from '../lib/image-processing/numbering';

// Worker에서 실행되는 메인 함수
self.onmessage = async (e: MessageEvent) => {
  const { imageDataUrl, options } = e.data;

  try {
    // 1. 이미지 로드 (ImageBitmap 사용)
    self.postMessage({ type: 'progress', progress: 10, message: '이미지 로드 중...' });
    const img = await loadImageInWorker(imageDataUrl);
    const originalSize = { width: img.width, height: img.height };

    // 2. OffscreenCanvas에 그리기
    self.postMessage({ type: 'progress', progress: 20, message: '이미지 준비 중...' });
    const imageData = getImageData(img);

    // 3. 그레이스케일 변환
    self.postMessage({ type: 'progress', progress: 30, message: '이미지 분석 중...' });
    const grayData = grayscaleConversion(imageData);

    // 4. Canny 엣지 검출 (무거운 작업!)
    self.postMessage({ type: 'progress', progress: 50, message: '윤곽 찾는 중...' });
    const edgeData = cannyEdgeDetection(grayData);

    // 5. 윤곽선 추출
    self.postMessage({ type: 'progress', progress: 60, message: '선 추출 중...' });
    const contours = extractContours(edgeData);

    // 6. 점 배치
    self.postMessage({ type: 'progress', progress: 70, message: '점 배치 중...' });
    const rawPoints = placePoints(contours, options.difficulty);

    // 7. 번호 매기기
    self.postMessage({ type: 'progress', progress: 90, message: '번호 매기는 중...' });
    const points = assignNumbers(rawPoints, options.startPosition);

    self.postMessage({ type: 'progress', progress: 100, message: '완료!' });

    // 결과 반환
    self.postMessage({
      type: 'success',
      result: { points, originalSize }
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
};

// Worker 내부에서 이미지 로드
function loadImageInWorker(dataUrl: string): Promise<ImageBitmap> {
  return fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => createImageBitmap(blob));
}

// ImageBitmap을 ImageData로 변환
function getImageData(img: ImageBitmap): ImageData {
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}
```

**메인 스레드 폴백 구현**

```typescript
// lib/image-processing/main-thread-processor.ts

import { grayscaleConversion } from './grayscale';
import { cannyEdgeDetection } from './edge-detection';
import { extractContours } from './contour-extraction';
import { placePoints } from './point-placement';
import { assignNumbers } from './numbering';

export async function processInMainThread(
  imageDataUrl: string,
  options: { difficulty: number; startPosition: string },
  onProgress?: (progress: number, message: string) => void
) {
  // 1. HTMLImageElement 로드
  onProgress?.(10, '이미지 로드 중...');
  const img = await loadImageInMainThread(imageDataUrl);
  const originalSize = { width: img.width, height: img.height };

  // 2. document.createElement('canvas') 사용
  onProgress?.(20, '이미지 준비 중...');
  const canvas = document.createElement('canvas');
  const maxSize = 1000;
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));

  canvas.width = Math.floor(img.width * scale);
  canvas.height = Math.floor(img.height * scale);

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // 3. 그레이스케일 변환
  onProgress?.(30, '이미지 분석 중...');
  const grayData = grayscaleConversion(imageData);

  // 4. Canny 엣지 검출
  onProgress?.(50, '윤곽 찾는 중...');
  const edgeData = cannyEdgeDetection(grayData);

  // 5. 윤곽선 추출 (가장 큰 윤곽선 1개만)
  onProgress?.(60, '선 추출 중...');
  const contours = extractContours(edgeData);

  // 6. 점 배치 (Douglas-Peucker 간소화)
  onProgress?.(70, '점 배치 중...');
  const rawPoints = placePoints(contours, options.difficulty);

  // 7. 번호 매기기 (배열 회전으로 시작점 설정)
  onProgress?.(90, '번호 매기는 중...');
  const points = assignNumbers(rawPoints, options.startPosition);

  onProgress?.(100, '완료!');

  // 원본 크기로 좌표 스케일 복원
  const scaledPoints = points.map(p => ({
    ...p,
    x: p.x / scale,
    y: p.y / scale,
  }));

  return { points: scaledPoints, originalSize };
}

function loadImageInMainThread(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
```

**React Hook with Fallback (자동 감지 + 폴백)**

```typescript
// hooks/usePuzzleGeneration.ts

import { useRef, useCallback, useState, useEffect } from 'react';
import { usePuzzleStore } from '@/stores/usePuzzleStore';
import { getRecommendedStrategy } from '@/lib/utils/feature-detection';
import { processInMainThread } from '@/lib/image-processing/main-thread-processor';

export function usePuzzleGeneration() {
  const workerRef = useRef<Worker | null>(null);
  const [strategy, setStrategy] = useState<'worker' | 'main-thread'>('worker');
  const [showWarning, setShowWarning] = useState(false);
  const { setPoints, setGenerating, setProgress, setError } = usePuzzleStore();

  // 브라우저 기능 감지
  useEffect(() => {
    const detectedStrategy = getRecommendedStrategy();
    setStrategy(detectedStrategy);

    if (detectedStrategy === 'main-thread') {
      setShowWarning(true);
      console.warn('⚠️ iOS Safari detected: Using main-thread fallback (slower performance)');
    }
  }, []);

  const generatePuzzle = useCallback(async (
    imageDataUrl: string,
    options: { difficulty: number; startPosition: string }
  ) => {
    setGenerating(true);
    setError(null);
    setProgress(0);

    try {
      if (strategy === 'worker') {
        // Worker 경로 (Chrome, Firefox, Safari 16.4+)
        if (!workerRef.current) {
          workerRef.current = new Worker(
            new URL('../workers/image-processor.worker.ts', import.meta.url),
            { type: 'module' }
          );
        }

        const worker = workerRef.current;

        const result = await new Promise<any>((resolve, reject) => {
          worker.onmessage = (e: MessageEvent) => {
            const { type, progress, result, error } = e.data;

            if (type === 'progress') {
              setProgress(progress);
            } else if (type === 'success') {
              resolve(result);
            } else if (type === 'error') {
              reject(new Error(error));
            }
          };

          worker.onerror = (error) => {
            reject(error);
          };

          worker.postMessage({ imageDataUrl, options });
        });

        setPoints(result.points, result.originalSize);
      } else {
        // 메인 스레드 폴백 (iOS Safari 15.x 이하)
        const result = await processInMainThread(
          imageDataUrl,
          options,
          (progress, message) => setProgress(progress)
        );

        setPoints(result.points, result.originalSize);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '퍼즐 생성 실패');
    } finally {
      setGenerating(false);
    }
  }, [strategy, setPoints, setGenerating, setProgress, setError]);

  return { generatePuzzle, strategy, showWarning };
}
```

**UI에 경고 표시**

```typescript
// components/editor/ControlPanel.tsx

export function ControlPanel() {
  const { generatePuzzle, strategy, showWarning } = usePuzzleGeneration();

  return (
    <div>
      {showWarning && (
        <Alert variant="warning">
          ⚠️ 이 브라우저에서는 퍼즐 생성 시 화면이 잠시 멈출 수 있습니다.
          최신 Safari(16.4+) 또는 Chrome을 권장합니다.
        </Alert>
      )}

      {/* ... 나머지 UI */}
    </div>
  );
}
```

**메모리 최적화**
- Canvas 재사용
- ImageData 즉시 해제
- 큰 배열 조기 GC

```typescript
// 좋은 예 (Worker 환경)
function processImage(img: ImageBitmap) {
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d')!;

  // 처리...

  // 메모리 해제
  canvas.width = 0;
  canvas.height = 0;
}
```

### 7.2. 번들 크기 최적화

**Next.js 설정**
```typescript
// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 자동 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // 번들 분석
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
```

### 7.3. 로딩 성능

**코드 스플리팅**
```typescript
// 동적 import
const PuzzleCanvas = dynamic(() => import('@/components/preview/PuzzleCanvas'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // 클라이언트 전용
});
```

**이미지 레이지 로딩**
```typescript
<Image
  src="/example.jpg"
  alt="Example"
  loading="lazy"
  width={500}
  height={500}
/>
```

---

## 8. 배포 전략

### 8.1. Vercel 배포 설정

**vercel.json**
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["icn1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 8.2. 환경 변수

```bash
# .env.local (개발)
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_ANALYTICS_ID=

# .env.production (프로덕션)
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
```

### 8.3. CI/CD

**GitHub Actions**
```yaml
# .github/workflows/deploy.yml

name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 9. 테스트 전략

### 9.1. 단위 테스트

```typescript
// tests/unit/douglas-peucker.test.ts

import { describe, it, expect } from 'vitest';
import { douglasPeucker } from '@/lib/image-processing/douglas-peucker';

describe('douglasPeucker', () => {
  it('should simplify a straight line to 2 points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ];

    const result = douglasPeucker(points, 0.1);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ x: 0, y: 0 });
    expect(result[1]).toEqual({ x: 3, y: 0 });
  });

  it('should keep important points with low epsilon', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
    ];

    const result = douglasPeucker(points, 0.5);
    
    expect(result.length).toBeGreaterThan(2);
  });
});
```

### 9.2. E2E 테스트

```typescript
// tests/e2e/puzzle-generation.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Puzzle Generation Flow', () => {
  test('should generate puzzle from uploaded image', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 이미지 업로드
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/simple-circle.png');

    // 편집 페이지로 이동 확인
    await expect(page).toHaveURL('/editor');

    // 퍼즐 생성
    await page.locator('button:has-text("퍼즐 만들기")').click();

    // 로딩 확인
    await expect(page.locator('text=처리 중')).toBeVisible();

    // 미리보기 확인 (최대 15초 대기)
    await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });

    // 다운로드 버튼 활성화 확인
    const downloadBtn = page.locator('button:has-text("PNG 다운로드")');
    await expect(downloadBtn).toBeEnabled();
  });
});
```

---