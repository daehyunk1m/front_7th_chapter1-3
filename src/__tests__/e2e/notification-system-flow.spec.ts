import { test, expect } from '@playwright/test';

import { resetTestData, seedTestData } from './helpers/test-helpers';

test.describe('알림 시스템', () => {
  test.beforeEach(async () => await resetTestData());
  test.afterAll(async () => await resetTestData());

  test('사용자가 설정한 알림 시간에 따라 일정 알림이 표시되고 시각적 표시가 적용된다', async ({
    page,
  }) => {
    // Increase test timeout to 90 seconds to allow time for notification to trigger
    test.setTimeout(90000);
    // Given: 2분 후 시작하는 일정 생성 (알림: 1분 전) -> 약 1분 후 알림 트리거
    const now = new Date();
    const eventStart = new Date(now.getTime() + 2 * 60 * 1000); // 2분 후

    // Use local time for both date and time to avoid timezone mismatch
    const eventDate = `${eventStart.getFullYear()}-${String(eventStart.getMonth() + 1).padStart(2, '0')}-${String(eventStart.getDate()).padStart(2, '0')}`;
    const eventTime = `${String(eventStart.getHours()).padStart(2, '0')}:${String(eventStart.getMinutes()).padStart(2, '0')}`;

    await page.goto('http://localhost:5173/');

    // 페이지 로드 확인
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();

    // 일정 생성
    await page.getByRole('textbox', { name: '제목' }).fill('알림 테스트 일정');
    await page.getByRole('textbox', { name: '날짜' }).fill(eventDate);
    await page.getByRole('textbox', { name: '시작 시간' }).fill(eventTime);
    const endTime = new Date(eventStart.getTime() + 30 * 60 * 1000); // 30분 후 종료
    await page.getByRole('textbox', { name: '종료 시간' }).fill(endTime.toTimeString().slice(0, 5));
    await page.getByRole('textbox', { name: '설명' }).fill('알림 테스트');
    await page.getByRole('textbox', { name: '위치' }).fill('테스트 위치');

    // 알림 시간을 1분 전으로 설정 (기본값이 10분 전이므로 해당 combobox 선택)
    const notificationSelect = page.getByRole('combobox', { name: '10분 전' });
    await notificationSelect.click();
    await page.getByText('1분 전').click();

    // 일정 추가
    await page.getByRole('button', { name: '일정 추가' }).click();

    // "일정이 추가되었습니다" 토스트가 사라질 때까지 대기
    await page.waitForTimeout(2000);

    // Then: 화면 우측 상단에 알림 팝업 표시 (약 1분 후 알림 트리거, 최대 65초 대기)
    await expect(
      page.getByText('1분 후 알림 테스트 일정 일정이 시작됩니다.')
    ).toBeVisible({ timeout: 65000 });

    // And: 일정 목록에서 해당 일정의 빨간색 표시 및 종 아이콘 확인
    const eventList = page.getByTestId('event-list');
    const eventItem = eventList.locator('div').filter({ hasText: '알림 테스트 일정' }).first();

    // 빨간색 텍스트 확인 (color: error)
    await expect(eventItem.locator('p').filter({ hasText: '알림 테스트 일정' })).toHaveCSS(
      'color',
      /rgb\(211, 47, 47\)|rgb\(244, 67, 54\)/ // MUI error color variations
    );

    // 종 아이콘 확인
    await expect(eventItem.locator('svg').first()).toBeVisible();

    // When: 알림 닫기 버튼 클릭
    const alert = page.getByText('1분 후 알림 테스트 일정 일정이 시작됩니다.').locator('xpath=ancestor::div[@role="alert"]').first();
    const closeButton = alert.locator('button').first();
    await closeButton.click();

    // Then: 알림 팝업 제거
    await expect(page.getByText('1분 후 알림 테스트 일정 일정이 시작됩니다.')).not.toBeVisible();

    // And: 빨간색 텍스트와 종 아이콘은 유지됨
    await expect(eventItem.locator('p').filter({ hasText: '알림 테스트 일정' })).toHaveCSS(
      'color',
      /rgb\(211, 47, 47\)|rgb\(244, 67, 54\)/
    );
    await expect(eventItem.locator('svg').first()).toBeVisible();
  });
});
