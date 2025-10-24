# 점잇기 퍼즐 생성기 🎨

사랑하는 딸을 위한 특별한 선물 - 이미지를 점잇기 퍼즐로 자동 변환하는 웹 애플리케이션입니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kimsol1134/dot_to_dot_puzzle)

## ✨ 주요 기능

- 📸 **이미지 업로드**: 드래그 앤 드롭으로 간편한 이미지 업로드
- 🎯 **난이도 조절**: 슬라이더로 점 개수 조절 (10-100개)
- 🎨 **스마트 처리**: Canny 엣지 검출과 Douglas-Peucker 알고리즘으로 최적화된 점 배치
- ⚡ **빠른 성능**: Web Worker를 통한 백그라운드 처리 (iOS Safari 폴백 지원)
- 📄 **고품질 출력**: A4 크기, 300 DPI PNG 파일로 다운로드
- 🧪 **100% 테스트 통과**: 54개 단위 테스트 + 5개 E2E 테스트

## 🚀 빠른 시작

### 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 테스트 실행

```bash
# 단위 테스트 (Vitest)
npm test

# E2E 테스트 (Playwright)
npm run test:e2e
```

## 📦 기술 스택

### 프레임워크 & 라이브러리
- **Next.js 15.1.0** - App Router, React 19
- **Tailwind CSS 3.4.1** - 스타일링
- **Zustand** - 상태 관리
- **shadcn/ui** - UI 컴포넌트

### 이미지 처리 알고리즘
1. **Grayscale Conversion** - Luminosity method (0.299R + 0.587G + 0.114B)
2. **Canny Edge Detection** - 5-stage pipeline (Gaussian blur → Sobel gradient → Non-max suppression → Double threshold → Hysteresis)
3. **Contour Extraction** - Moore-neighborhood tracing
4. **Douglas-Peucker** - Line simplification
5. **Point Placement** - Difficulty-based epsilon conversion
6. **Point Numbering** - Array rotation (순서 보존)

### 테스팅
- **Vitest** - 단위 테스트 (jsdom)
- **Playwright** - E2E 테스트
- **node-canvas** - Canvas API polyfill

### 성능 최적화
- **Web Worker** - 메인 스레드 블로킹 방지
- **OffscreenCanvas & ImageBitmap** - 고성능 이미지 처리
- **Main-thread fallback** - iOS Safari 15.x 호환성

## 🎯 사용 방법

1. **이미지 업로드**
   - 단순한 배경의 캐릭터/동물 이미지 권장
   - 대상과 배경의 대비가 뚜렷한 이미지 사용
   - JPG/PNG 파일 (최대 5MB)

2. **난이도 조절**
   - 슬라이더로 점 개수 조절 (10-100개)
   - 낮은 난이도: 쉬운 퍼즐 (어린이용)
   - 높은 난이도: 복잡한 퍼즐 (도전 과제)

3. **시작 위치 선택**
   - 왼쪽 위 / 오른쪽 위 / 가운데
   - #1 점이 빨간 원으로 표시됨

4. **퍼즐 생성 & 다운로드**
   - "퍼즐 만들기" 버튼 클릭
   - 미리보기 확인 후 PNG 다운로드

## 📊 테스트 결과

### 단위 테스트 (54/54 통과)
- ✅ Grayscale conversion (6 tests)
- ✅ Canny edge detection (7 tests)
- ✅ Contour extraction (6 tests)
- ✅ Douglas-Peucker (10 tests)
- ✅ Point placement (9 tests)
- ✅ Point numbering (10 tests)
- ✅ Image store (6 tests)

### E2E 테스트 (5/5 통과, 6.4초)
- ✅ Full flow: Upload → Generate → Download
- ✅ Performance SLA: < 5초 (실제 2.5초)
- ✅ Error handling: Non-image file rejection
- ✅ Difficulty slider interaction
- ✅ Start position selection

## 🌐 Vercel 배포

### 자동 배포 (권장)

1. [https://vercel.com/new](https://vercel.com/new) 접속
2. "Import Git Repository" 클릭
3. `kimsol1134/dot_to_dot_puzzle` 저장소 선택
4. Framework Preset: **Next.js** (자동 감지)
5. "Deploy" 클릭

배포 완료 후 `https://your-project.vercel.app` URL이 생성됩니다.

### 수동 배포 (CLI)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 환경 변수

현재 프로젝트는 환경 변수가 필요 없습니다. 모든 처리가 클라이언트 사이드에서 이루어집니다.

## 📁 프로젝트 구조

```
dot_to_dot_puzzle/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 홈페이지 (이미지 업로드)
│   │   └── editor/page.tsx    # 편집 페이지
│   ├── components/
│   │   ├── upload/            # 이미지 업로드 컴포넌트
│   │   ├── editor/            # 제어 패널
│   │   └── preview/           # 캔버스 & 다운로드
│   ├── lib/
│   │   └── image-processing/  # 6개 알고리즘
│   ├── workers/               # Web Worker
│   ├── stores/                # Zustand 상태 관리
│   └── hooks/                 # React Hooks
├── tests/
│   ├── unit/                  # Vitest 단위 테스트
│   ├── e2e/                   # Playwright E2E 테스트
│   └── fixtures/              # 테스트용 이미지
└── docs/                      # 프로젝트 문서
    ├── PRD.md                # 제품 요구사항 정의서
    ├── ARCHITECTURE.md       # 아키텍처 문서
    └── IMPLEMENTATION_PLAN.md # 구현 계획서
```

## 🔧 개발 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 실행
npm start

# 단위 테스트
npm test

# 단위 테스트 (UI)
npm run test:ui

# E2E 테스트
npm run test:e2e

# E2E 테스트 (UI 모드)
npm run test:e2e:ui

# Lint 검사
npm run lint
```

## 📝 브라우저 호환성

| 브라우저 | 버전 | Web Worker | 성능 |
|---------|------|-----------|------|
| Chrome | 90+ | ✅ 지원 | ⚡ 빠름 |
| Firefox | 88+ | ✅ 지원 | ⚡ 빠름 |
| Safari | 16.4+ | ✅ 지원 | ⚡ 빠름 |
| iOS Safari | 15.x | ⚠️ 폴백 | 🐢 느림 |
| Edge | 90+ | ✅ 지원 | ⚡ 빠름 |

**참고**: iOS Safari 15.x는 OffscreenCanvas를 지원하지 않아 메인 스레드에서 처리됩니다. 업그레이드를 권장합니다.

## 🤝 기여하기

이 프로젝트는 개인 프로젝트이지만 개선 제안은 언제나 환영합니다!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 개인용으로 제작되었습니다.

## 🙏 감사의 말

- **Claude Code** - AI 페어 프로그래밍
- **shadcn/ui** - 아름다운 UI 컴포넌트
- **Vercel** - 손쉬운 배포 플랫폼

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**
