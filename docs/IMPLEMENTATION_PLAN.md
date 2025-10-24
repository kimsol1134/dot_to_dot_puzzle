---

# 점잇기 퍼즐 생성기 - 구현 계획서

**문서 버전**: 2.0 (클라이언트 사이드)  
**작성일**: 2025년 10월 23일  
**프로젝트 기간**: 2주 (MVP)

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [개발 일정 (2주)](#2-개발-일정-2주)
3. [Day 1-2: 프로젝트 초기화](#3-day-1-2-프로젝트-초기화)
4. [Day 3-4: 이미지 업로드](#4-day-3-4-이미지-업로드)
5. [Day 5-7: 핵심 알고리즘](#5-day-5-7-핵심-알고리즘)
6. [Day 8-9: 출력 및 UI](#6-day-8-9-출력-및-ui)
7. [Day 10: 배포 및 테스트](#7-day-10-배포-및-테스트)
8. [체크리스트](#8-체크리스트)

---

## 1. 프로젝트 개요

### 1.1. 목표
2주 내에 **완전히 작동하는 점잇기 퍼즐 생성기**를 개발하고 Vercel에 배포

### 1.2. 핵심 원칙
- ✅ **단순함**: 복잡한 인프라 없이 클라이언트만 사용
- ✅ **빠름**: 2주 안에 배포 가능한 MVP
- ✅ **작동**: 완벽하지 않아도 작동하는 제품

### 1.3. 개발 환경
```bash
- OS: macOS / Windows / Linux
- Node.js: 20.x
- 패키지 관리자: pnpm (권장) 또는 npm
- 에디터: VS Code
- 브라우저: Chrome (개발 및 테스트)
```

---

## 2. 개발 일정 (2주)

| 일차 | 날짜 | 작업 | 목표 | 완료 |
|------|------|------|------|------|
| Day 1-2 | Week 1 Mon-Tue | 프로젝트 초기화, UI 기반 | Next.js 앱 실행 | ☐ |
| Day 3-4 | Week 1 Wed-Thu | 이미지 업로드 기능 | 이미지 로드 완료 | ☐ |
| Day 5-7 | Week 1 Fri - Week 2 Mon | 핵심 알고리즘 구현 | 퍼즐 생성 작동 | ☐ |
| Day 8-9 | Week 2 Tue-Wed | 출력 및 UI 완성 | PNG 다운로드 | ☐ |
| Day 10 | Week 2 Thu | 배포 및 테스트 | Vercel 배포 완료 | ☐ |

---

## 3. Day 1-2: 프로젝트 초기화

### 3.1. 환경 설정 (2시간)

#### Step 1: Node.js 설치 확인
```bash
node --version  # v20.x 이상
npm --version   # v10.x 이상

# pnpm 설치 (권장)
npm install -g pnpm
```

#### Step 2: Next.js 프로젝트 생성

```bash
# 프로젝트 생성 (Next.js 15)
npx create-next-app@latest connect-the-dots --typescript --tailwind --app --turbopack --no-src

cd connect-the-dots

# package.json의 버전 확인
# "next": "15.x"
# "react": "^19.x"
# "react-dom": "^19.x"

# 의존성 설치
pnpm install zustand

# shadcn/ui 초기화
npx shadcn@latest init

# 필수 컴포넌트 설치
npx shadcn@latest add button slider card alert

# Vitest 설치 (단위 테스트용)
pnpm install -D vitest @vitest/ui

# Playwright 설치 (E2E 테스트용)
pnpm create playwright
```

**Vitest 설정**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**package.json에 스크립트 추가**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  }
}
```

#### Step 3: 프로젝트 구조 생성
```bash
# 디렉토리 생성
mkdir -p app/editor
mkdir -p components/{ui,layout,upload,editor,preview,common}
mkdir -p lib/{image-processing,output,utils}
mkdir -p stores
mkdir -p types
mkdir -p hooks
mkdir -p public/examples

# Git 초기화
git init
git add .
git commit -m "Initial commit"
```

**✅ 체크포인트**: `pnpm dev` 실행 시 Next.js 앱이 정상 작동

---

### 3.2. 기본 레이아웃 구현 (3시간)

#### Task 1.1: 루트 레이아웃
```typescript
// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '점잇기 퍼즐 생성기',
  description: '사진을 점잇기 퍼즐로 바꿔보세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
```

#### Task 1.2: 헤더 컴포넌트
```typescript
// components/layout/Header.tsx

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🎨 점잇기 퍼즐 생성기</h1>
          <p className="text-sm text-gray-600">
            사진을 점잇기 퍼즐로 바꿔보세요
          </p>
        </div>
        
        
          href="/guides"
          className="text-sm text-blue-600 hover:underline"
        >
          사용 가이드
        </a>
      </div>
    </header>
  );
}
```

#### Task 1.3: 푸터 컴포넌트
```typescript
// components/layout/Footer.tsx

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
        <p>© 2025 점잇기 퍼즐 생성기</p>
        <p className="mt-2">
          만든 퍼즐은 개인 용도로만 사용해 주세요 ❤️
        </p>
      </div>
    </footer>
  );
}
```

#### Task 1.4: 홈페이지 기본 구조
```typescript
// app/page.tsx

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* 소개 */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">
          사진을 점잇기 퍼즐로 바꿔보세요!
        </h2>
        <p className="text-lg text-gray-600">
          아이가 좋아하는 캐릭터나 동물 사진을 업로드하면
          <br />
          자동으로 점잇기 퍼즐을 만들어드려요
        </p>
      </div>

      {/* 업로드 영역 (다음 단계에서 구현) */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center">
        <p className="text-gray-500">이미지 업로드 영역 (구현 예정)</p>
      </div>

      {/* 가이드 */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6 bg-green-50 rounded-lg">
          <h3 className="text-lg font-bold mb-2">✅ 좋은 이미지</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• 배경이 단순한 이미지</li>
            <li>• 윤곽이 명확한 캐릭터/동물</li>
            <li>• 대비가 좋은 이미지</li>
          </ul>
        </div>
        
        <div className="p-6 bg-red-50 rounded-lg">
          <h3 className="text-lg font-bold mb-2">❌ 어려운 이미지</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• 복잡한 배경 (풍경 등)</li>
            <li>• 윤곽이 불분명한 이미지</li>
            <li>• 대비가 낮은 이미지</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

**✅ 체크포인트**: 브라우저에서 헤더, 푸터, 홈페이지 레이아웃이 보임

---

### 3.3. Zustand 스토어 초기화 (2시간)

#### Task 1.5: Image Store
```typescript
// stores/useImageStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ImageState {
  file: File | null;
  dataUrl: string | null;
  width: number;
  height: number;
  name: string;
  size: number;
  
  setImage: (file: File) => Promise<void>;
  clearImage: () => void;
}

export const useImageStore = create<ImageState>()(
  devtools(
    (set) => ({
      file: null,
      dataUrl: null,
      width: 0,
      height: 0,
      name: '',
      size: 0,
      
      setImage: async (file: File) => {
        // Data URL 생성
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
    }),
    { name: 'ImageStore' }
  )
);
```

#### Task 1.6: Puzzle Store
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
  difficulty: number;
  startPosition: 'top-left' | 'top-right' | 'center';
  points: Point[];
  originalSize: { width: number; height: number };
  isGenerating: boolean;
  progress: number;
  error: string | null;
  
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
      difficulty: 50,
      startPosition: 'top-left',
      points: [],
      originalSize: { width: 0, height: 0 },
      isGenerating: false,
      progress: 0,
      error: null,
      
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

**✅ Day 1-2 완료 기준**
- [ ] Next.js 앱이 로컬에서 실행됨
- [ ] 헤더, 푸터, 홈페이지 레이아웃 완성
- [ ] Zustand 스토어 초기화 완료
- [ ] Git 커밋 완료

---

## 4. Day 3-4: 이미지 업로드

### 4.1. 이미지 업로더 컴포넌트 (4시간)

#### Task 2.1: 기본 드롭존 UI
```typescript
// components/upload/ImageUploader.tsx

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
      await setImage(file);
      router.push('/editor');
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
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/jpeg,image/png"
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
              <p className="text-sm text-gray-500">
                JPG, PNG 파일 지원 (최대 5MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
```

#### Task 2.2: 홈페이지에 업로더 추가
```typescript
// app/page.tsx (업데이트)

import ImageUploader from '@/components/upload/ImageUploader';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* 소개 */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">
          사진을 점잇기 퍼즐로 바꿔보세요!
        </h2>
        <p className="text-lg text-gray-600">
          아이가 좋아하는 캐릭터나 동물 사진을 업로드하면
          <br />
          자동으로 점잇기 퍼즐을 만들어드려요
        </p>
      </div>

      {/* 업로드 영역 */}
      <ImageUploader />

      {/* 가이드 (이전과 동일) */}
      {/* ... */}
    </div>
  );
}
```

**✅ 체크포인트**: 이미지 선택 시 `/editor`로 이동

---

### 4.2. 편집 페이지 기본 구조 (3시간)

#### Task 2.3: 편집 페이지
```typescript
// app/editor/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useImageStore } from '@/stores/useImageStore';
import { Button } from '@/components/ui/button';

export default function EditorPage() {
  const router = useRouter();
  const { dataUrl, name, width, height, clearImage } = useImageStore();

  useEffect(() => {
    if (!dataUrl) {
      router.push('/');
    }
  }, [dataUrl, router]);

  if (!dataUrl) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">퍼즐 만들기</h2>
          <p className="text-sm text-gray-600">{name}</p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => {
            clearImage();
            router.push('/');
          }}
        >
          ← 다른 사진 선택
        </Button>
      </div>

      {/* 메인 영역 */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* 왼쪽: 원본 이미지 */}
        <div>
          <h3 className="text-lg font-bold mb-4">원본 이미지</h3>
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <img
              src={dataUrl}
              alt="원본"
              className="w-full h-auto"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            크기: {width} × {height}px
          </p>
        </div>

        {/* 오른쪽: 설정 (다음 단계에서 구현) */}
        <div>
          <h3 className="text-lg font-bold mb-4">설정</h3>
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            설정 패널 (구현 예정)
          </div>
        </div>
      </div>
    </div>
  );
}
```

**✅ Day 3-4 완료 기준**
- [ ] 이미지 드래그 앤 드롭 작동
- [ ] 파일 선택 버튼 작동
- [ ] 편집 페이지로 이동
- [ ] 원본 이미지 표시
- [ ] Git 커밋

---

## 5. Day 5-7: 핵심 알고리즘

### 5.1. 이미지 처리 유틸리티 (2시간)

#### Task 3.1: 그레이스케일 변환
```typescript
// lib/image-processing/grayscale.ts

export function grayscaleConversion(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  const grayData = new ImageData(width, height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    grayData.data[i] = gray;
    grayData.data[i + 1] = gray;
    grayData.data[i + 2] = gray;
    grayData.data[i + 3] = 255;
  }

  return grayData;
}
```

#### Task 3.2: Canny 엣지 검출
```typescript
// lib/image-processing/edge-detection.ts

// ⚠️ 주의: ARCHITECTURE.md 5.3의 전체 Canny 구현을 참조하세요.
// 여기서는 간략한 인터페이스만 표시합니다.
// MVP를 위해 Sobel이 아닌 Canny를 사용해야 합니다.
// Canny는 노이즈를 제거하고 주요 외곽선만 검출합니다.

export function cannyEdgeDetection(imageData: ImageData): ImageData {
  const { width, height } = imageData;

  // 1. Gaussian Blur (노이즈 제거)
  const blurred = gaussianBlur(imageData, 1.4);

  // 2. Sobel 그라디언트 계산
  const { magnitude, direction } = computeGradient(blurred);

  // 3. Non-maximum Suppression
  const suppressed = nonMaxSuppression(magnitude, direction, width, height);

  // 4. Double Threshold
  const thresholded = doubleThreshold(suppressed, width, height, 50, 100);

  // 5. Edge Tracking by Hysteresis
  const edges = edgeTrackingHysteresis(thresholded, width, height);

  return edges;
}

// 세부 구현은 ARCHITECTURE.md 5.3 참조
// gaussianBlur, computeGradient, nonMaxSuppression,
// doubleThreshold, edgeTrackingHysteresis 함수들
```

---

### 5.2. 윤곽선 추출 (4시간)

**⚠️ 중요 변경사항**:
- 모든 윤곽선이 아닌 **가장 큰 윤곽선 1개만** 반환합니다.
- **순서를 보존하는 윤곽선 추적 알고리즘**을 사용합니다.
- ARCHITECTURE.md 5.4의 전체 구현을 참조하세요.

**⚠️ 순서 보존이 왜 중요한가?**

만약 단순 스캔으로 엣지 픽셀을 누적하면:
```
[픽셀(10,10), 픽셀(50,30), 픽셀(15,11), 픽셀(80,20), ...]
```
이 배열은 **공간상 무작위 순서**입니다. Douglas-Peucker와 번호 매기기가 이 순서를 전제로 하면 **선이 교차하고 형태가 붕괴**됩니다.

올바른 윤곽선 추적:
```
[점A(10,10), 점B(11,10), 점C(12,10), 점D(12,11), ...]
```
이 배열은 **윤곽선을 따라 시계 방향으로 정렬**되어 있습니다.

```typescript
// lib/image-processing/contour-extraction.ts

export interface Contour {
  points: Array<{ x: number; y: number }>;
  length: number;
}

export function extractContours(edgeData: ImageData): Contour[] {
  const { data, width, height } = edgeData;

  // 1. 이진화
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
        // ⭐ 핵심: 윤곽선을 순서대로 추적
        const contour = traceContour(binaryData, visited, width, height, x, y);

        if (contour.points.length > 50) {
          contours.push(contour);
        }
      }
    }
  }

  // 3. 가장 긴 윤곽선 1개만 반환 ⭐
  contours.sort((a, b) => b.length - a.length);
  return contours.length > 0 ? [contours[0]] : [];
}

// ⭐ 윤곽선 추적 알고리즘 (순서 보존)
// ARCHITECTURE.md 5.4의 전체 구현을 여기에 작성하세요.
function traceContour(
  binaryData: Uint8Array,
  visited: Uint8Array,
  width: number,
  height: number,
  startX: number,
  startY: number
): Contour {
  const points: Array<{ x: number; y: number }> = [];

  // 윤곽선을 시계 방향으로 추적
  let x = startX;
  let y = startY;
  let direction = 0; // 시작 방향 (동쪽)

  // 8방향 (동, 남동, 남, 남서, 서, 북서, 북, 북동)
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

**단위 테스트로 검증**

```typescript
// tests/unit/contour-extraction.test.ts

import { describe, it, expect } from 'vitest';
import { extractContours } from '@/lib/image-processing/contour-extraction';

describe('extractContours', () => {
  it('윤곽선이 순서대로 정렬됨', () => {
    // 3x3 정사각형 만들기
    const imageData = createSquareEdgeImage(100, 100, 30, 30, 40, 40);

    const contours = extractContours(imageData);
    const points = contours[0].points;

    // 인접한 점들이 실제로 인접한 픽셀인지 확인
    for (let i = 0; i < points.length - 1; i++) {
      const dist = Math.sqrt(
        (points[i + 1].x - points[i].x) ** 2 +
        (points[i + 1].y - points[i].y) ** 2
      );
      // 8방향 이웃이므로 거리는 최대 sqrt(2) ≈ 1.41
      expect(dist).toBeLessThanOrEqual(1.5);
    }
  });
});
```

---

### 5.3. Douglas-Peucker + 점 배치 (4시간)

```typescript
// lib/image-processing/douglas-peucker.ts

export function douglasPeucker(
  points: Array<{ x: number; y: number }>,
  epsilon: number
): Array<{ x: number; y: number }> {
  if (points.length <= 2) return points;

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

  if (maxDistance > epsilon) {
    const left = douglasPeucker(points.slice(0, maxIndex + 1), epsilon);
    const right = douglasPeucker(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  } else {
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

  if (dx === 0 && dy === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  const numerator = Math.abs(dy * px - dx * py + x2 * y1 - y2 * x1);
  const denominator = Math.sqrt(dx ** 2 + dy ** 2);

  return numerator / denominator;
}
```

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

  if (contours.length === 0 || contours[0].points.length === 0) {
    return [];
  }

  const contour = contours[0];

  // Douglas-Peucker 알고리즘으로 점 단순화
  const simplified = douglasPeucker(contour.points, epsilon);

  // PlacedPoint로 변환
  const allPoints: PlacedPoint[] = simplified.map(point => ({
    x: point.x,
    y: point.y,
    contourId: 0,
  }));

  // ⭐ step 샘플링 대신 최소 거리 제약 사용
  // 번호가 겹치지 않도록 일정 거리 이상 떨어진 점만 선택
  const minDistance = 20; // 픽셀
  return enforceMinDistance(allPoints, minDistance);
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

---

### 5.4. 번호 매기기 (2시간)

**⭐ 중요**: Nearest Neighbor 방식으로 재정렬하지 마세요!
Douglas-Peucker는 순서를 보존하므로, 시작점의 인덱스만 찾아서 배열을 회전시키면 됩니다.

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
    return points.reduce(
      (minIdx, point, idx) =>
        point.x + point.y < points[minIdx].x + points[minIdx].y ? idx : minIdx,
      0
    );
  } else if (startPosition === 'top-right') {
    const maxX = Math.max(...points.map(p => p.x));
    return points.reduce(
      (minIdx, point, idx) =>
        (maxX - point.x) + point.y < (maxX - points[minIdx].x) + points[minIdx].y
          ? idx
          : minIdx,
      0
    );
  } else {
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

### 5.5. 메인 파이프라인 (3시간)

**⚠️ 중요**: Worker에서 실행 가능하도록 작성합니다!

이 파이프라인은 **Worker 내부**에서 실행되므로:
- `document.createElement('canvas')` ❌
- `OffscreenCanvas` ✅
- `HTMLImageElement` ❌
- `ImageBitmap` ✅

```typescript
// lib/image-processing/index.ts

import { grayscaleConversion } from './grayscale';
import { cannyEdgeDetection } from './edge-detection';
import { extractContours } from './contour-extraction';
import { placePoints } from './point-placement';
import { assignNumbers } from './numbering';

export interface ProcessingOptions {
  difficulty: number;
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

  // 1. 이미지 로드 (Worker 호환)
  onProgress?.(10, '이미지 로드 중...');
  const img = await loadImageInWorker(imageDataUrl);
  const originalSize = { width: img.width, height: img.height };

  // 2. Canvas에 그리기 (OffscreenCanvas 사용)
  onProgress?.(20, '이미지 준비 중...');
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

  // 5. 윤곽선 추출
  onProgress?.(60, '선 추출 중...');
  const contours = extractContours(edgeData);

  // 6. 점 배치
  onProgress?.(70, '점 배치 중...');
  const rawPoints = placePoints(contours, difficulty);

  // 7. 번호 매기기
  onProgress?.(90, '번호 매기는 중...');
  const points = assignNumbers(rawPoints, startPosition);

  onProgress?.(100, '완료!');

  // 원본 크기로 좌표 복원
  const scaledPoints = points.map(p => ({
    ...p,
    x: p.x / scale,
    y: p.y / scale,
  }));

  return { points: scaledPoints, originalSize };
}

// ⭐ Worker에서 이미지 로드 (ImageBitmap 사용)
function loadImageInWorker(dataUrl: string): Promise<ImageBitmap> {
  return fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => createImageBitmap(blob));
}
```

### 5.6. 단위 테스트 작성 (3시간)

**⚠️ 중요**: 알고리즘 검증을 위해 단위 테스트는 필수입니다!

```typescript
// tests/unit/douglas-peucker.test.ts

import { describe, it, expect } from 'vitest';
import { douglasPeucker } from '@/lib/image-processing/douglas-peucker';

describe('douglasPeucker', () => {
  it('직선은 2개 점으로 단순화', () => {
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

  it('중요한 점은 유지', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 10 }, // 중요한 점
      { x: 2, y: 0 },
    ];

    const result = douglasPeucker(points, 0.5);

    expect(result.length).toBeGreaterThan(2);
    expect(result).toContainEqual({ x: 1, y: 10 });
  });
});
```

```typescript
// tests/unit/numbering.test.ts

import { describe, it, expect } from 'vitest';
import { assignNumbers } from '@/lib/image-processing/numbering';

describe('assignNumbers', () => {
  it('시작점부터 순서대로 번호 매김', () => {
    const points = [
      { x: 10, y: 10, contourId: 0 },
      { x: 20, y: 10, contourId: 0 },
      { x: 30, y: 10, contourId: 0 },
      { x: 40, y: 10, contourId: 0 },
      { x: 50, y: 10, contourId: 0 },
    ];

    // 시작점은 첫 번째 점 (x=10)
    const result = assignNumbers(points, 'top-left');

    expect(result[0].number).toBe(1);
    expect(result[0].x).toBe(10);
    expect(result[1].number).toBe(2);
    expect(result[1].x).toBe(20);
  });

  it('배열을 회전하여 시작점부터 시작', () => {
    const points = [
      { x: 50, y: 50, contourId: 0 }, // C
      { x: 60, y: 50, contourId: 0 }, // D
      { x: 70, y: 50, contourId: 0 }, // E
      { x: 10, y: 10, contourId: 0 }, // A (가장 왼쪽 위)
      { x: 20, y: 20, contourId: 0 }, // B
    ];

    const result = assignNumbers(points, 'top-left');

    // 1번은 (10, 10)이어야 함
    expect(result[0]).toEqual({ x: 10, y: 10, number: 1 });
    expect(result[1]).toEqual({ x: 20, y: 20, number: 2 });
    expect(result[2]).toEqual({ x: 50, y: 50, number: 3 });
  });
});
```

### 5.7. 브라우저 호환성 및 Feature Detection (1시간)

**⚠️ iOS Safari 대응 필수**: iPad/iPhone 사용자(주 타겟층)를 위한 폴백 전략

먼저 feature detection 유틸리티를 작성합니다:

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

메인 스레드 폴백 프로세서를 작성합니다:

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

  // 3-7. 동일한 알고리즘 실행
  onProgress?.(30, '이미지 분석 중...');
  const grayData = grayscaleConversion(imageData);

  onProgress?.(50, '윤곽 찾는 중...');
  const edgeData = cannyEdgeDetection(grayData);

  onProgress?.(60, '선 추출 중...');
  const contours = extractContours(edgeData);

  onProgress?.(70, '점 배치 중...');
  const rawPoints = placePoints(contours, options.difficulty);

  onProgress?.(90, '번호 매기는 중...');
  const points = assignNumbers(rawPoints, options.startPosition);

  onProgress?.(100, '완료!');

  // 스케일 복원
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

### 5.8. Web Worker 구현 (2시간)

**⚠️ MVP 필수**: 메인 스레드 블로킹을 방지하고 5초 SLA를 달성하기 위해 필수입니다.

```typescript
// workers/image-processor.worker.ts

import { processImageToPuzzle } from '../lib/image-processing';

// Worker에서 실행되는 메인 함수
self.onmessage = async (e: MessageEvent) => {
  const { imageDataUrl, options } = e.data;

  try {
    // processImageToPuzzle을 Worker에서 실행
    const result = await processImageToPuzzle(imageDataUrl, {
      ...options,
      onProgress: (progress: number, message: string) => {
        // 진행률을 메인 스레드로 전송
        self.postMessage({ type: 'progress', progress, message });
      },
    });

    // 성공 결과 전송
    self.postMessage({
      type: 'success',
      result: { points: result.points, originalSize: result.originalSize }
    });
  } catch (error) {
    // 에러 전송
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
};
```

**✅ Day 5-7 완료 기준**
- [ ] Canny 엣지 검출 구현
- [ ] 가장 큰 윤곽선 1개 추출
- [ ] Douglas-Peucker 알고리즘 구현
- [ ] enforceMinDistance로 점 필터링
- [ ] 배열 회전 방식으로 번호 매기기
- [ ] processImageToPuzzle이 OffscreenCanvas 사용
- [ ] **Web Worker 구현 및 통합**
- [ ] **단위 테스트 작성 및 통과**
- [ ] 테스트 이미지로 점 배치 확인
- [ ] 난이도에 따라 점 개수 변화
- [ ] Worker에서 실행 시 UI가 멈추지 않는지 확인
- [ ] Git 커밋

---

## 6. Day 8-9: 출력 및 UI

### 6.1. 제어 패널 (3시간)

**⚠️ 중요**: Web Worker를 사용하여 메인 스레드 블로킹을 방지합니다!

먼저 `usePuzzleGeneration` 훅을 작성합니다 (자동 폴백 포함):

```typescript
// hooks/usePuzzleGeneration.ts

'use client';

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
    options: { difficulty: number; startPosition: 'top-left' | 'top-right' | 'center' }
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
            const { type, progress, message, result, error } = e.data;

            if (type === 'progress') {
              setProgress(progress);
              console.log(`${progress}%: ${message}`);
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
          (progress, message) => {
            setProgress(progress);
            console.log(`${progress}%: ${message}`);
          }
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

이제 ControlPanel에서 이 훅을 사용합니다:

```typescript
// components/editor/ControlPanel.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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

    // ⭐ Worker 또는 메인 스레드에서 실행 (자동 감지)
    await generatePuzzle(dataUrl, {
      difficulty,
      startPosition,
    });
  };

  const estimatedPoints = Math.round(10 + (difficulty / 100) * 90);

  return (
    <div className="space-y-6">
      {/* iOS Safari 경고 */}
      {showWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ 이 브라우저에서는 퍼즐 생성 시 화면이 잠시 멈출 수 있습니다.
            <br />
            최신 Safari (16.4+) 또는 Chrome을 권장합니다.
          </p>
        </div>
      )}

      {/* 난이도 */}
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
        />
        
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>쉬움</span>
          <span>어려움</span>
        </div>
      </div>

      {/* 시작 위치 */}
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

      {/* 생성 버튼 */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? `처리 중... ${progress}%` : '🎨 퍼즐 만들기!'}
      </Button>

      {/* 에러 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
```

---

### 6.2. 캔버스 미리보기 (4시간)

```typescript
// components/preview/PuzzleCanvas.tsx

'use client';

import { useEffect, useRef } from 'react';
import { usePuzzleStore } from '@/stores/usePuzzleStore';

export default function PuzzleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { points, originalSize } = usePuzzleStore();

  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const canvasWidth = 600;
    const canvasHeight = 848;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const margin = 50;
    const availableWidth = canvasWidth - 2 * margin;
    const availableHeight = canvasHeight - 2 * margin;
    
    const scale = Math.min(
      availableWidth / originalSize.width,
      availableHeight / originalSize.height
    );

    const scaledWidth = originalSize.width * scale;
    const scaledHeight = originalSize.height * scale;
    const offsetX = (canvasWidth - scaledWidth) / 2;
    const offsetY = (canvasHeight - scaledHeight) / 2;

    points.forEach((point) => {
      const x = point.x * scale + offsetX;
      const y = point.y * scale + offsetY;

      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(point.number.toString(), x + 8, y - 5);

      if (point.number === 1) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

  }, [points, originalSize]);

  if (points.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
      <canvas ref={canvasRef} className="w-full h-auto" />
    </div>
  );
}
```

---

### 6.3. PNG 다운로드 (2시간)

```typescript
// components/preview/DownloadButton.tsx

'use client';

import { Button } from '@/components/ui/button';
import { usePuzzleStore } from '@/stores/usePuzzleStore';

export default function DownloadButton() {
  const { points, originalSize } = usePuzzleStore();

  if (points.length === 0) return null;

  const handleDownload = () => {
    // 고해상도 캔버스 생성
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // A4 @ 300 DPI
    canvas.width = 2480;
    canvas.height = 3508;

    // 흰색 배경
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 스케일 계산
    const margin = 200;
    const availableWidth = canvas.width - 2 * margin;
    const availableHeight = canvas.height - 2 * margin;
    
    const scale = Math.min(
      availableWidth / originalSize.width,
      availableHeight / originalSize.height
    );

    const scaledWidth = originalSize.width * scale;
    const scaledHeight = originalSize.height * scale;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    // 점 그리기
    points.forEach((point) => {
      const x = point.x * scale + offsetX;
      const y = point.y * scale + offsetY;

      // 점
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.fill();

      // 번호
      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(point.number.toString(), x + 20, y - 10);

      // 1번 강조
      if (point.number === 1) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // 다운로드
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `puzzle-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <Button onClick={handleDownload} size="lg" className="w-full">
      📥 PNG 다운로드
    </Button>
  );
}
```

---

### 6.4. 편집 페이지 완성 (2시간)

```typescript
// app/editor/page.tsx (완전한 버전)

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useImageStore } from '@/stores/useImageStore';
import { usePuzzleStore } from '@/stores/usePuzzleStore';
import { Button } from '@/components/ui/button';
import ControlPanel from '@/components/editor/ControlPanel';
import PuzzleCanvas from '@/components/preview/PuzzleCanvas';
import DownloadButton from '@/components/preview/DownloadButton';

export default function EditorPage() {
  const router = useRouter();
  const { dataUrl, name, width, height, clearImage } = useImageStore();
  const { points } = usePuzzleStore();

  useEffect(() => {
    if (!dataUrl) {
      router.push('/');
    }
  }, [dataUrl, router]);

  if (!dataUrl) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">퍼즐 만들기</h2>
          <p className="text-sm text-gray-600">{name}</p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => {
            clearImage();
            router.push('/');
          }}
        >
          ← 다른 사진 선택
        </Button>
      </div>

      {/* 메인 영역 */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* 왼쪽: 원본 이미지 */}
        <div>
          <h3 className="text-lg font-bold mb-4">원본 이미지</h3>
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <img src={dataUrl} alt="원본" className="w-full h-auto" />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            크기: {width} × {height}px
          </p>
        </div>

        {/* 오른쪽: 설정 */}
        <div>
          <h3 className="text-lg font-bold mb-4">설정</h3>
          <ControlPanel />
        </div>
      </div>

      {/* 미리보기 */}
      {points.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">미리보기</h3>
          <p className="text-sm text-gray-600">
            {points.length}개의 점이 생성되었습니다
          </p>
          
          <PuzzleCanvas />
          
          <DownloadButton />
        </div>
      )}
    </div>
  );
}
```

### 6.5. E2E 테스트 작성 (3시간)

**⚠️ 중요**: ARCHITECTURE.md는 Playwright 기반 자동화를 계획했지만, 기존 PLAN에는 콘솔 로그와 수동 체크리스트만 있습니다. CI에서 `pnpm test:e2e`를 통과하려면 E2E 테스트가 필수입니다.

```typescript
// tests/e2e/puzzle-generation.spec.ts

import { test, expect } from '@playwright/test';

test.describe('전체 퍼즐 생성 플로우', () => {
  test('이미지 업로드 → 퍼즐 생성 → 다운로드', async ({ page }) => {
    // 1. 홈페이지 접속
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/점잇기 퍼즐 생성기/);

    // 2. 이미지 업로드
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/simple-circle.png');

    // 3. 편집 페이지로 이동 확인
    await expect(page).toHaveURL(/\/editor/);

    // 4. 난이도 조절
    const slider = page.locator('input[type="range"]');
    await slider.fill('50');

    // 5. 퍼즐 생성
    await page.locator('button:has-text("퍼즐 만들기")').click();

    // 6. 로딩 표시 확인
    await expect(page.locator('text=처리 중')).toBeVisible();

    // 7. 미리보기 캔버스 확인 (최대 10초 대기)
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    // 8. 다운로드 버튼 활성화 확인
    const downloadBtn = page.locator('button:has-text("PNG 다운로드")');
    await expect(downloadBtn).toBeEnabled();

    // 9. 다운로드 실행 (파일 저장 확인)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downloadBtn.click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/puzzle-.*\.png/);
  });

  test('성능: 5초 이내 미리보기 (F-03 SLA)', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/test-500x500.png');

    await expect(page).toHaveURL(/\/editor/);

    // 시작 시간 기록
    const startTime = Date.now();

    await page.locator('button:has-text("퍼즐 만들기")').click();

    // 캔버스 표시까지 대기
    await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 });

    const elapsed = Date.now() - startTime;

    // 5초 SLA 검증 (데스크톱 기준)
    expect(elapsed).toBeLessThan(5000);
  });

  test('에러 처리: 지원하지 않는 파일 형식', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/test.txt');

    // 에러 메시지 확인
    await expect(page.locator('text=이미지 파일만 업로드할 수 있어요')).toBeVisible();
  });
});
```

**Playwright 설정**

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**✅ Day 8-9 완료 기준**
- [ ] 난이도 슬라이더 작동
- [ ] 시작 위치 선택 작동
- [ ] 퍼즐 만들기 버튼으로 생성
- [ ] 캔버스 미리보기 표시
- [ ] PNG 다운로드 작동
- [ ] **E2E 테스트 작성 및 통과 (pnpm test:e2e)**
- [ ] Git 커밋

---

## 7. Day 10: 배포 및 테스트

### 7.1. Vercel 배포 (2시간)

#### Step 1: GitHub에 푸시
```bash
git add .
git commit -m "MVP 완성"
git branch -M main
git remote add origin https://github.com/your-username/connect-the-dots.git
git push -u origin main
```

#### Step 2: Vercel 배포
1. https://vercel.com 접속
2. "Import Project" 클릭
3. GitHub 리포지토리 선택
4. "Deploy" 클릭
5. 배포 완료 대기 (2~3분)

**✅ 배포 완료**: Vercel URL로 접속하여 작동 확인

---

### 7.2. 테스트 (3시간)

#### 자동화된 테스트 실행

**단위 테스트 실행**
```bash
# 모든 단위 테스트 실행
pnpm test

# 커버리지 확인
pnpm test -- --coverage

# 목표: 핵심 알고리즘 80% 이상 커버리지
```

**E2E 테스트 실행**
```bash
# E2E 테스트 실행
pnpm test:e2e

# 특정 브라우저만 테스트
pnpm test:e2e --project=chromium
pnpm test:e2e --project="Mobile Safari"

# UI 모드로 디버깅
pnpm test:e2e --ui
```

#### 자동화된 테스트 체크리스트

**✅ 자동화 완료 (E2E 테스트)**
- [x] 홈페이지 로드
- [x] 이미지 파일 선택
- [x] 편집 페이지 이동
- [x] 난이도 조절
- [x] 퍼즐 생성
- [x] PNG 다운로드
- [x] 5초 SLA 검증 (F-03)
- [x] 에러 처리 (잘못된 파일 형식)

**수동 테스트 (자동화 어려운 항목)**
- [ ] 드래그 앤 드롭 UI 확인
- [ ] 캔버스 렌더링 품질 육안 확인
- [ ] 다양한 이미지로 퍼즐 품질 확인:
  - [ ] 단순한 로고 (예상: 양호)
  - [ ] 캐릭터 이미지 (예상: 양호)
  - [ ] 동물 사진 (예상: 보통)
  - [ ] 복잡한 배경 (예상: 불량, 경고 메시지 표시)

**크로스 브라우저 테스트**

Playwright가 자동으로 Chromium, Safari(Webkit)를 테스트합니다.

수동 확인:
- [ ] Chrome (Desktop)
- [ ] Safari (Desktop)
- [ ] Firefox (선택)
- [ ] iPhone Safari
- [ ] Android Chrome

**성능 테스트**

```bash
# Lighthouse 실행
npx lighthouse http://localhost:3000 --view

# 목표:
# - Performance: 90+
# - Accessibility: 90+
# - Best Practices: 90+
```

**CI/CD 파이프라인 확인**

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Build
        run: pnpm build
```

---

### 7.3. 버그 수정 및 마무리 (3시간)

발견된 버그를 수정하고 최종 배포

```bash
git add .
git commit -m "버그 수정 및 최적화"
git push origin main
```

Vercel이 자동으로 재배포합니다.

---

## 8. 체크리스트

### 최종 완료 체크리스트

**Day 1-2**
- [ ] Next.js 프로젝트 생성
- [ ] 기본 레이아웃 (헤더, 푸터)
- [ ] Zustand 스토어 초기화

**Day 3-4**
- [ ] 이미지 업로더 구현
- [ ] 편집 페이지 기본 구조

**Day 5-7**
- [ ] 그레이스케일 변환
- [ ] Sobel 엣지 검출
- [ ] 윤곽선 추출
- [ ] Douglas-Peucker 알고리즘
- [ ] 점 배치
- [ ] 번호 매기기
- [ ] 메인 파이프라인

**Day 8-9**
- [ ] 제어 패널
- [ ] 캔버스 미리보기
- [ ] PNG 다운로드
- [ ] 편집 페이지 완성

**Day 10**
- [ ] Vercel 배포
- [ ] 테스트
- [ ] 버그 수정

---

## 부록: 빠른 명령어

```bash
# 개발 서버
pnpm dev

# 빌드
pnpm build

# 로컬에서 프로덕션 실행
pnpm start

# 타입 체크
pnpm tsc --noEmit

# 포맷팅
pnpm prettier --write .

# Git
git add .
git commit -m "메시지"
git push origin main
```
