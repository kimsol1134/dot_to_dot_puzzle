/**
 * E2E Test: Puzzle Generation Flow
 *
 * Tests the complete user journey:
 * 1. Upload image
 * 2. Adjust difficulty
 * 3. Generate puzzle
 * 4. Download PNG
 *
 * Also tests performance (SLA) and error handling.
 */

import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('전체 퍼즐 생성 플로우', () => {
  test('이미지 업로드 → 퍼즐 생성 → 다운로드', async ({ page }) => {
    // 1. 홈페이지 접속 (E2E test mode to force main-thread execution)
    await page.goto('/?e2e-test-mode=true');
    await expect(page).toHaveTitle(/점잇기 퍼즐 생성기/);

    // 2. 이미지 업로드
    const fileInput = page.locator('input[type="file"]');
    const fixturePath = path.join(__dirname, '../fixtures/simple-circle.png');
    await fileInput.setInputFiles(fixturePath);

    // 3. 편집 페이지로 자동 이동 확인
    await expect(page).toHaveURL(/\/editor/);

    // 4. 이미지 정보 표시 확인
    await expect(page.getByText(/100 × 100px/)).toBeVisible();

    // 5. 난이도 조절 (Radix UI Slider - role="slider" 사용)
    const slider = page.getByRole('slider');
    await slider.waitFor({ state: 'visible', timeout: 10000 });
    // Radix UI Slider uses arrow keys, not fill()
    await slider.click(); // Focus the slider
    await slider.press('End'); // Move to max value (100)
    for (let i = 0; i < 50; i++) {
      await slider.press('ArrowLeft'); // Move left 50 times to reach 50
    }

    // 6. 퍼즐 생성 버튼 클릭
    const generateButton = page.locator('button:has-text("퍼즐 만들기")');
    await expect(generateButton).toBeEnabled();
    await generateButton.click();

    // 7. 로딩 표시 확인
    await expect(page.locator('text=처리 중')).toBeVisible();

    // 8. 미리보기 캔버스 확인 (최대 10초 대기)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // 9. 다운로드 버튼 활성화 확인
    const downloadBtn = page.locator('button:has-text("PNG 다운로드")');
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toBeEnabled();

    // 10. 다운로드 실행 (파일 저장 확인)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downloadBtn.click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/puzzle-.*\.png/);
  });

  test('성능: 5초 이내 미리보기 (F-03 SLA)', async ({ page }) => {
    await page.goto('/?e2e-test-mode=true');

    // 500x500px 이미지 업로드
    const fileInput = page.locator('input[type="file"]');
    const fixturePath = path.join(__dirname, '../fixtures/test-500x500.png');
    await fileInput.setInputFiles(fixturePath);

    await expect(page).toHaveURL(/\/editor/);

    // 시작 시간 기록
    const startTime = Date.now();

    // 퍼즐 생성
    await page.locator('button:has-text("퍼즐 만들기")').click();

    // 캔버스 표시까지 대기
    await expect(page.locator('canvas')).toBeVisible({ timeout: 6000 });

    const elapsed = Date.now() - startTime;

    // 5초 SLA 검증 (데스크톱 기준, 여유 1초 추가)
    expect(elapsed).toBeLessThan(6000);
    console.log(`✓ Puzzle generated in ${elapsed}ms`);
  });

  test('에러 처리: 지원하지 않는 파일 형식', async ({ page }) => {
    await page.goto('/?e2e-test-mode=true');

    // 텍스트 파일 업로드 시도
    const fileInput = page.locator('input[type="file"]');
    const fixturePath = path.join(__dirname, '../fixtures/test.txt');
    await fileInput.setInputFiles(fixturePath);

    // 에러 메시지 확인
    await expect(page.locator('text=이미지 파일만 업로드할 수 있어요')).toBeVisible();

    // 편집 페이지로 이동하지 않아야 함 (query parameter 포함)
    await expect(page).toHaveURL('/?e2e-test-mode=true');
  });

  test('난이도 변경에 따른 점 개수 추정 표시', async ({ page }) => {
    await page.goto('/?e2e-test-mode=true');

    const fileInput = page.locator('input[type="file"]');
    const fixturePath = path.join(__dirname, '../fixtures/simple-circle.png');
    await fileInput.setInputFiles(fixturePath);

    await expect(page).toHaveURL(/\/editor/);

    // 난이도 0 (쉬움) - 약 10개 (Radix UI Slider)
    const slider = page.getByRole('slider');
    await slider.waitFor({ state: 'visible', timeout: 10000 });
    await slider.click(); // Focus
    await slider.press('Home'); // Move to min value (0)
    await expect(page.locator('text=약 10개의 점')).toBeVisible();

    // 난이도 100 (어려움) - 약 100개
    await slider.press('End'); // Move to max value (100)
    await expect(page.locator('text=약 100개의 점')).toBeVisible();
  });

  test('시작 위치 선택 기능', async ({ page }) => {
    await page.goto('/?e2e-test-mode=true');

    const fileInput = page.locator('input[type="file"]');
    const fixturePath = path.join(__dirname, '../fixtures/simple-circle.png');
    await fileInput.setInputFiles(fixturePath);

    await expect(page).toHaveURL(/\/editor/);

    // 시작 위치 버튼 확인
    await expect(page.locator('button:has-text("왼쪽 위")')).toBeVisible();
    await expect(page.locator('button:has-text("오른쪽 위")')).toBeVisible();
    await expect(page.locator('button:has-text("가운데")')).toBeVisible();

    // 시작 위치 변경
    await page.locator('button:has-text("오른쪽 위")').click();
    await expect(page.locator('button:has-text("오른쪽 위")')).toHaveClass(/border-blue-500/);
  });
});
