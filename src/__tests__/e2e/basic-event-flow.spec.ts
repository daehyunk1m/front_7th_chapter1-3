import { test, expect } from '@playwright/test';

import { resetTestData, seedTestData } from './helpers/test-helpers';

test.describe('기본 일정 관리 워크플로우', () => {
  // beforeEach에서 모든 이벤트 삭제
  test.beforeEach(async () => await resetTestData());

  // 모든 테스트 종료 후 모든 이벤트 초기화
  test.afterAll(async () => await resetTestData());

  test('페이지가 정상적으로 로드된다.', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // 주요 요소 표시되는지 확인
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '일정 보기' })).toBeVisible();
    await expect(page.getByText('일정 검색')).toBeVisible();
  });

  test('새로운 일정을 추가하고 조회 할 수 있다.', async ({ page }) => {
    // Given: 사용자가 캘린더 앱에 접속
    await page.goto('http://localhost:5173/');
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '일정 보기' })).toBeVisible();
    await expect(page.getByText('일정 검색')).toBeVisible();

    // When: 새 일정 폼을 작성
    await page.getByRole('textbox', { name: '제목' }).click();
    await page.getByRole('textbox', { name: '제목' }).fill('일정 테스트');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-06');
    await page.getByRole('textbox', { name: '시작 시간' }).click();
    await page.getByRole('textbox', { name: '시작 시간' }).fill('14:00');
    await page.getByRole('textbox', { name: '종료 시간' }).click();
    await page.getByRole('textbox', { name: '종료 시간' }).fill('15:00');
    await page.getByRole('textbox', { name: '설명' }).click();
    await page.getByRole('textbox', { name: '설명' }).fill('일정 설명');
    await page.getByRole('textbox', { name: '위치' }).click();
    await page.getByRole('textbox', { name: '위치' }).fill('일정 위치');
    await page.getByRole('combobox', { name: '업무' }).click();
    await page.getByRole('option', { name: '기타-option' }).click();
    await page.getByRole('combobox', { name: '분 전' }).click();
    await page.getByRole('option', { name: '1시간 전' }).click();
    // When: 제출
    await page.getByTestId('event-submit-button').click();

    // Then: 일정이 캘린더 뷰와 일정 리스트에 표시됨
    await expect(page.getByRole('button', { name: '일정 테스트' })).toBeVisible();

    await expect(page.getByTestId('event-list')).toContainText('일정 테스트');
    await expect(page.getByTestId('event-list')).toContainText('2025-11-06');
    await expect(page.getByTestId('event-list')).toContainText('일정 설명');
    await expect(page.getByTestId('event-list')).toContainText('일정 위치');
    await expect(page.getByTestId('event-list')).toContainText('카테고리: 기타');
    await expect(page.getByTestId('event-list')).toContainText('알림: 1시간 전');
  });

  test('생성된 일정을 수정할 수 있다.', async ({ page }) => {
    // Given: 기존 일정이 있는 상태
    await seedTestData('single-event');
    await page.goto('http://localhost:5173/');

    // 초기 일정 확인
    await expect(page.getByRole('button', { name: '테스트 회의' })).toBeVisible();
    await expect(page.getByTestId('event-list')).toContainText('테스트 회의');
    await expect(page.getByTestId('event-list')).toContainText('2025-11-15');
    await expect(page.getByTestId('event-list')).toContainText('10:00 - 11:00');

    // When: 수정 버튼 클릭
    const item = page
      .locator('data-testid=event-list')
      .filter({ has: page.getByText('테스트 회의') });

    await item.getByRole('button', { name: 'Edit event' }).click();
    await expect(page.getByTestId('event-submit-button')).toContainText('일정 수정');

    // 제목 수정
    await page.getByRole('textbox', { name: '제목' }).click();
    await page.getByRole('textbox', { name: '제목' }).fill('수정된 회의');

    // 날짜 수정
    await page.getByRole('textbox', { name: '날짜' }).click();
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-20');

    // 시간 수정
    await page.getByRole('textbox', { name: '시작 시간' }).click();
    await page.getByRole('textbox', { name: '시작 시간' }).fill('14:00');
    await page.getByRole('textbox', { name: '종료 시간' }).click();
    await page.getByRole('textbox', { name: '종료 시간' }).fill('15:30');

    // 설명 수정
    await page.getByRole('textbox', { name: '설명' }).click();
    await page.getByRole('textbox', { name: '설명' }).fill('수정된 설명');

    // 위치 수정
    await page.getByRole('textbox', { name: '위치' }).click();
    await page.getByRole('textbox', { name: '위치' }).fill('수정된 위치');

    // 카테고리 수정
    await page.getByRole('combobox', { name: '업무' }).click();
    await page.getByRole('option', { name: '기타-option' }).click();

    // 알림 시간 수정
    await page.getByRole('combobox', { name: '분 전' }).click();
    await page.getByRole('option', { name: '1시간 전' }).click();

    // 제출
    await page.getByTestId('event-submit-button').click();

    // Then: 수정된 내용이 UI에 반영됨
    await expect(page.getByRole('button', { name: '수정된 회의' })).toBeVisible();
    await expect(page.getByTestId('event-list')).toContainText('수정된 회의');
    await expect(page.getByTestId('event-list')).toContainText('2025-11-20');
    await expect(page.getByTestId('event-list')).toContainText('14:00 - 15:30');
    await expect(page.getByTestId('event-list')).toContainText('수정된 설명');
    await expect(page.getByTestId('event-list')).toContainText('수정된 위치');
    await expect(page.getByTestId('event-list')).toContainText('카테고리: 기타');
    await expect(page.getByTestId('event-list')).toContainText('알림: 1시간 전');
  });

  test('일정을 삭제할 수 있다.', async ({ page }) => {
    // Given: 기존 일정이 있는 상태
    await seedTestData('single-event');
    await page.goto('http://localhost:5173/');

    // 초기 일정 확인
    await expect(page.getByRole('button', { name: '테스트 회의' })).toBeVisible();
    await expect(page.getByTestId('event-list')).toContainText('테스트 회의');
    await expect(page.getByTestId('event-list')).toContainText('2025-11-15');
    await expect(page.getByTestId('event-list')).toContainText('10:00 - 11:00');

    // When: 일정을 클릭하여 삭제 모드 진입
    const item = page
      .locator('data-testid=event-list')
      .filter({ has: page.getByText('테스트 회의') });

    // 삭제 버튼 클릭 (삭제 UI가 표시됨)
    await item.getByRole('button', { name: 'Delete event' }).click();

    // 삭제 확인 알림 표시 (Snackbar는 빠르게 사라질 수 있으므로 대기 시간 조정)
    await expect(page.getByText(/일정이 삭제되었습니다/)).toBeVisible({ timeout: 3000 });

    // Then: 일정이 더 이상 표시되지 않음
    await expect(page.getByRole('button', { name: '테스트 회의' })).not.toBeVisible();
    await expect(page.getByTestId('event-list')).not.toContainText('테스트 회의');
    await expect(page.getByTestId('event-list')).not.toContainText('2025-11-15');
    await expect(page.getByTestId('event-list')).not.toContainText('10:00 - 11:00');
  });
});
