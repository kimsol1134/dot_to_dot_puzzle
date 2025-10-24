Task별 Todo List
구현 계획서(IMPLEMENTATION_PLAN.md)와 아키텍처(ARCHITECTURE.md)를 기반으로, 빈 Next.js 프로젝트에서 시작하는 상세 Todo List입니다.

Task 1: 프로젝트 초기화 및 안정성 검증 (Day 1-2)
10일 중 2일을 환경 설정에 할당한 것은 최신 스택의 리스크를 인지한 좋은 계획입니다.

[ ] npx create-next-app@latest ...로 Next.js 15, React 19, Tailwind 4 프로젝트 생성

[ ] pnpm install zustand (상태 관리)

[ ] npx shadcn@latest init 및 필수 컴포넌트(button, slider, card, alert) 설치

[ ] pnpm install -D vitest @vitest/ui @vitejs/plugin-react (단위 테스트)

[ ] pnpm create playwright (E2E 테스트)

[ ] vitest.config.ts 및 playwright.config.ts 설정 (경로 alias @/* 포함)

[ ] pnpm dev, pnpm build, pnpm test, pnpm test:e2e 기본 명령 실행 (Go/No-Go 결정)

[Decision]: 여기서 shadcn/ui 호환성 문제나 빌드 오류 발생 시, 즉시 pnpm install next@14 react@18 tailwindcss@3로 롤백합니다. 2주 MVP에서 안정성이 더 중요합니다.

Task 2: 전역 상태 및 레이아웃 (Day 1-2)
[ ] stores/useImageStore.ts 작성 (파일, dataUrl, 크기 등 원본 이미지 정보)

[ ] stores/usePuzzleStore.ts 작성 (difficulty, startPosition, points, isGenerating 등 퍼즐 상태)

[ ] app/layout.tsx에 Header 및 Footer 컴포넌트 적용

[ ] components/layout/Header.tsx 및 Footer.tsx 마크업

[ ] app/page.tsx 홈페이지 기본 레이아웃 (소개, 가이드 섹션)

[ ] app/editor/page.tsx 편집 페이지 기본 레이아웃

Task 3: 이미지 업로드 기능 (Day 3-4)
[ ] components/upload/ImageUploader.tsx 컴포넌트 작성

[ ] useCallback 및 useState를 사용한 드래그 앤 드롭 로직 구현 (계획서 4.1 기반)

[Decision]: react-dropzone 라이브러리를 사용하면 더 간결하지만, 계획서의 코드는 의존성이 없고 간단하므로 그대로 따릅니다.

[ ] 파일 유효성 검사 (이미지 형식, 5MB 크기 제한)

[ ] 이미지 업로드 성공 시 useImageStore.setImage 호출 (Data URL 변환 및 크기 저장)

[ ] useRouter를 사용하여 /editor 페이지로 리다이렉트

[ ] app/page.tsx에 ImageUploader 컴포넌트 삽입

[ ] app/editor/page.tsx에서 useImageStore를 구독하여 원본 이미지 표시

Task 4: 핵심 알고리즘 (TDD) (Day 5-7)
이 Task는 UI와 분리하여 순수 TypeScript 함수로 작성하고 Vitest로 검증합니다.

[ ] (TDD) lib/image-processing/grayscale.ts: grayscaleConversion 함수 작성

[ ] (TDD) lib/image-processing/edge-detection.ts: Canny 엣지 검출 파이프라인 구현

[Decision]: ARCHITECTURE.md(5.3)에 따라 Sobel이 아닌 Canny를 구현합니다. gaussianBlur, computeGradient, nonMaxSuppression, doubleThreshold, edgeTrackingHysteresis 5단계를 모두 구현해야 합니다.

[ ] (TDD) lib/image-processing/contour-extraction.ts: extractContours 함수 작성

[Decision]: ARCHITECTURE.md(5.4)의 요구사항대로, '가장 긴 윤곽선 1개' 만을 반환하도록 로직을 구현합니다. traceContour (순서 보존)가 핵심입니다.

[ ] (TDD) lib/image-processing/douglas-peucker.ts: douglasPeucker 및 perpendicularDistance 함수 작성

[ ] (TDD) lib/image-processing/point-placement.ts: placePoints 및 enforceMinDistance 함수 작성

[Decision]: '난이도'를 epsilon 값으로 변환하는 로직과, enforceMinDistance로 점 겹침을 방지하는 2단계 필터링을 구현합니다. (ARCHITECTURE.md 5.6)

[ ] (TDD) lib/image-processing/numbering.ts: assignNumbers 함수 작성

[Decision]: ARCHITECTURE.md(5.7)의 경고대로, Nearest Neighbor 정렬이 아닌 배열 회전(rotate) 방식을 사용합니다. findStartPointIndex 함수가 핵심입니다.

Task 5: Web Worker 및 폴백 통합 (Day 5-7)
알고리즘(Task 4)과 UI(Task 6)를 연결하는 가장 중요한 '배관' 작업입니다.

[ ] lib/image-processing/index.ts: Task 4의 함수들을 통합하는 processImageToPuzzle 메인 파이프라인 작성 (OffscreenCanvas, ImageBitmap 사용)

[ ] workers/image-processor.worker.ts: self.onmessage 핸들러 작성. processImageToPuzzle 호출 및 postMessage (progress, success, error) 로직 구현

[ ] lib/utils/feature-detection.ts: getRecommendedStrategy ('worker' vs 'main-thread') 함수 작성

[ ] lib/image-processing/main-thread-processor.ts: 메인 스레드 폴백용 processInMainThread 함수 작성 (HTMLImageElement, document.createElement('canvas') 사용)

[ ] hooks/usePuzzleGeneration.ts: strategy를 감지하고, generatePuzzle 호출 시 'worker' 또는 'main-thread'로 분기하는 로직 구현. (Worker 이벤트 리스너 포함)

Task 6: 편집기 UI 및 제어 (Day 8-9)
[ ] components/editor/ControlPanel.tsx 컴포넌트 작성

[ ] shadcn/slider를 사용하여 usePuzzleStore.difficulty 바인딩

[ ] shadcn/button (토글 그룹)을 사용하여 usePuzzleStore.startPosition 바인딩

[ ] usePuzzleGeneration 훅(Task 5)을 가져와 '퍼즐 만들기' 버튼(onClick)에 generatePuzzle 함수 연결

[ ] isGenerating, progress 상태에 따른 버튼 비활성화 및 로딩 표시

[ ] showWarning (메인 스레드 폴백 시) 및 error 상태에 따른 shadcn/alert 표시

[ ] app/editor/page.tsx에 ControlPanel 컴포넌트 삽입

Task 7: 결과물 미리보기 및 다운로드 (Day 8-9)
[ ] components/preview/PuzzleCanvas.tsx 컴포넌트 작성

[ ] useRef<HTMLCanvasElement> 및 useEffect 사용

[ ] usePuzzleStore.points가 변경될 때마다 Canvas에 점과 숫자 그리기 (A4 비율 캔버스)

[ ] 1번 점은 빨간색 원으로 강조 (계획서 4.3.2)

[ ] components/preview/DownloadButton.tsx 컴포넌트 작성

[ ] onClick 시, 고해상도(A4 @ 300DPI = 2480x3508px) 캔버스를 메모리에 생성

[ ] PuzzleCanvas와 동일한 로직으로 점과 숫자 그리기 (크기만 다름)

[ ] canvas.toBlob() 및 URL.createObjectURL을 사용하여 PNG 파일 다운로드

[ ] app/editor/page.tsx에서 points.length > 0일 때 PuzzleCanvas와 DownloadButton 렌더링

Task 8: E2E 테스트 및 배포 (Day 10)
[ ] tests/fixtures/에 테스트용 이미지 추가 (단순한 원, 복잡한 사진)

[ ] tests/e2e/puzzle-generation.spec.ts E2E 테스트 작성 (Playwright)

[ ] Test 1 (Happy Path): 이미지 업로드 -> 난이도 조절 -> '만들기' 클릭 -> canvas 로드 확인 -> '다운로드' 클릭 및 파일 확인

[ ] Test 2 (SLA): 500x500px 이미지로 5초 이내 canvas 로드되는지 검증 (F-03)

[ ] Test 3 (Error Path): 텍스트 파일 업로드 시 에러 메시지(text=이미지 파일만) 확인

[ ] pnpm test:e2e 통과 확인

[ ] GitHub 리포지토리 생성 및 Vercel 프로젝트 연결

[ ] main 브랜치 푸시 및 자동 배포 확인