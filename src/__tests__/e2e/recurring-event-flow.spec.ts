import { test, expect } from '@playwright/test';

import { resetTestData, getAllEvents } from './helpers/test-helpers';

test.describe('반복 일정 관리 워크플로우', () => {
  // 테스트들을 순차적으로 실행하여 데이터 간섭 방지
  test.describe.configure({ mode: 'serial' });

  // beforeEach에서 모든 이벤트 삭제
  test.beforeEach(async () => await resetTestData());

  // 모든 테스트 종료 후 모든 이벤트 초기화
  test.afterAll(async () => await resetTestData());

  test('주간 반복 일정을 생성하고 단일/전체 인스턴스를 수정 및 삭제할 수 있다', async ({
    page,
  }) => {
    // Given: 사용자가 캘린더 앱에 접속
    await page.goto('http://localhost:5173/');
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();

    // When: 주간 반복 일정 생성 (매주 월요일, 4주간)
    await page.getByRole('textbox', { name: '제목' }).fill('주간 팀 회의');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-10'); // 월요일
    await page.getByRole('textbox', { name: '시작 시간' }).fill('10:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('11:00');
    await page.getByRole('textbox', { name: '설명' }).fill('매주 월요일 팀 미팅');
    await page.getByRole('textbox', { name: '위치' }).fill('회의실 A');
    await page.getByRole('combobox', { name: '업무' }).click();
    await page.getByRole('option', { name: '업무-option' }).click();

    // 반복 일정 설정
    await page.getByRole('checkbox', { name: '반복 일정' }).check();

    // 반복 유형 선택 필드가 나타날 때까지 대기
    const repeatTypeSelect = page.getByRole('combobox', { name: '반복 유형' });
    await expect(repeatTypeSelect).toBeVisible();
    await repeatTypeSelect.click();
    await page.getByRole('option', { name: 'weekly-option' }).click();

    await page.locator('#repeat-interval').fill('1');
    await page.locator('#repeat-end-date').fill('2025-12-01'); // 4주간

    await page.getByTestId('event-submit-button').click();

    // Then: 여러 개의 주간 반복 일정이 생성됨
    // 이벤트 생성 후 UI 업데이트 대기
    await page.waitForTimeout(1000);

    // API를 통해 실제로 생성된 이벤트 수 확인
    const events = await getAllEvents();
    const weeklyEvents = events.filter((e) => e.title === '주간 팀 회의');
    expect(weeklyEvents.length).toBeGreaterThanOrEqual(3); // 최소 3개 이상

    // 캘린더에 표시 확인
    const eventButtons = page.getByRole('button', { name: '주간 팀 회의' });
    await expect(eventButtons.first()).toBeVisible();

    // When: 두 번째 인스턴스만 수정 (단일 수정)
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toContainText('주간 팀 회의', { timeout: 10000 });

    // 첫 번째 일정의 수정 버튼 클릭 (주간 팀 회의 이벤트의 첫 번째)
    // 제목이 포함된 div 내의 Edit 버튼 찾기
    await page
      .locator('div:has-text("주간 팀 회의") button[aria-label="Edit event"]')
      .first()
      .click();

    // 반복 일정 수정 다이얼로그가 나타날 때까지 대기
    await page.waitForTimeout(500);

    // 반복 일정 수정 다이얼로그에서 "예" (단일 수정) 선택
    await expect(page.getByRole('heading', { name: '반복 일정 수정' })).toBeVisible();
    await expect(page.getByText(/해당 일정만 수정하시겠어요?/)).toBeVisible();
    await page.getByRole('button', { name: '예' }).click();

    // 폼이 로드될 때까지 대기
    await page.waitForTimeout(500);

    // 제목만 수정
    await expect(page.getByTestId('event-submit-button')).toContainText('일정 수정');
    await page.getByRole('textbox', { name: '제목' }).fill('주간 팀 회의 (수정됨)');
    await page.getByTestId('event-submit-button').click();

    // UI 업데이트 대기 (더 긴 시간)
    await page.waitForTimeout(2000);

    // 페이지 새로고침으로 UI 강제 업데이트
    await page.reload();
    await page.waitForTimeout(1000);

    // Then: 해당 인스턴스만 변경되고 나머지는 유지
    // API로 실제 데이터 확인
    const eventsAfterEdit = await getAllEvents();
    const modifiedEvent = eventsAfterEdit.find((e) => e.title === '주간 팀 회의 (수정됨)');
    const originalEvents = eventsAfterEdit.filter((e) => e.title === '주간 팀 회의');

    console.log('Modified event:', modifiedEvent);
    console.log('Original events count:', originalEvents.length);

    expect(modifiedEvent).toBeDefined(); // 수정된 이벤트가 존재해야 함
    expect(originalEvents.length).toBeGreaterThanOrEqual(3); // 원래 이벤트들도 존재해야 함

    // UI 강제 업데이트
    await page.reload();
    await page.waitForTimeout(1000);

    // UI에서도 확인
    await expect(page.getByRole('button', { name: '주간 팀 회의 (수정됨)' })).toBeVisible();
    await expect(page.getByRole('button', { name: '주간 팀 회의' }).first()).toBeVisible(); // 원래 제목도 존재

    // When: 단일 수정된 이벤트 삭제 (반복 설정이 제거되었으므로 다이얼로그 없음)
    await page
      .locator('div:has-text("주간 팀 회의 (수정됨)") button[aria-label="Delete event"]')
      .first()
      .click();

    // Then: 다이얼로그 없이 바로 삭제됨
    await expect(page.getByText(/일정이 삭제되었습니다/)).toBeVisible({ timeout: 3000 });

    // 수정된 이벤트만 삭제되고 나머지는 존재
    await page.waitForTimeout(1000);
    const afterSingleDelete = await getAllEvents();
    const eventsAfterSingleDelete = afterSingleDelete.filter(
      (e) => e.title === '주간 팀 회의' || e.title === '주간 팀 회의 (수정됨)'
    );
    expect(eventsAfterSingleDelete.some((e) => e.title === '주간 팀 회의')).toBe(true);
    expect(eventsAfterSingleDelete.some((e) => e.title === '주간 팀 회의 (수정됨)')).toBe(false);

    // UI 강제 업데이트
    await page.reload();
    await page.waitForTimeout(1000);

    // When: 반복 일정 전체 삭제 (수정되지 않은 원본 이벤트 삭제)
    await page
      .locator('div:has-text("주간 팀 회의") button[aria-label="Delete event"]')
      .first()
      .click();

    // 반복 일정 삭제 다이얼로그에서 "아니오" (전체 삭제) 선택
    await expect(page.getByRole('heading', { name: '반복 일정 삭제' })).toBeVisible();
    await page.getByRole('button', { name: '아니오' }).click();

    // Then: 모든 반복 일정이 제거됨
    await expect(page.getByText(/일정이 삭제되었습니다/)).toBeVisible({ timeout: 3000 });

    // 페이지 새로고침 후 확인
    await page.waitForTimeout(1000);
    const finalEvents = await getAllEvents();
    const finalWeeklyEvents = finalEvents.filter((e) => e.title === '주간 팀 회의');
    expect(finalWeeklyEvents.length).toBe(0);
  });

  test('일간 반복 일정을 생성하고 관리할 수 있다', async ({ page }) => {
    // Given: 사용자가 캘린더 앱에 접속
    await page.goto('http://localhost:5173/');

    // When: 일간 반복 일정 생성 (5일간)
    await page.getByRole('textbox', { name: '제목' }).fill('일일 스탠드업');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-10');
    await page.getByRole('textbox', { name: '시작 시간' }).fill('09:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('09:15');
    await page.getByRole('textbox', { name: '설명' }).fill('매일 아침 스탠드업');

    // 반복 일정 설정
    await page.getByRole('checkbox', { name: '반복 일정' }).check();

    // 반복 유형 선택 필드가 나타날 때까지 대기
    const repeatTypeSelect = page.getByRole('combobox', { name: '반복 유형' });
    await expect(repeatTypeSelect).toBeVisible();
    await repeatTypeSelect.click();
    await page.getByRole('option', { name: 'daily-option' }).click();

    await page.locator('#repeat-interval').fill('1');
    await page.locator('#repeat-end-date').fill('2025-11-14'); // 5일간

    await page.getByTestId('event-submit-button').click();

    // Then: 여러 개의 일간 반복 일정이 생성됨
    // 이벤트 생성 후 UI 업데이트 대기
    await page.waitForTimeout(1000);

    const events = await getAllEvents();
    const dailyEvents = events.filter((e) => e.title === '일일 스탠드업');
    expect(dailyEvents.length).toBe(5); // 정확히 5일

    // 캘린더에 표시 확인 (이벤트 로딩 대기)
    await expect(page.getByTestId('event-list')).toContainText('일일 스탠드업', { timeout: 10000 });
    await expect(page.getByRole('button', { name: '일일 스탠드업' }).first()).toBeVisible();

    // When: 전체 삭제
    await page
      .locator('div:has-text("일일 스탠드업") button[aria-label="Delete event"]')
      .first()
      .click();
    await expect(page.getByRole('heading', { name: '반복 일정 삭제' })).toBeVisible();
    await page.getByRole('button', { name: '아니오' }).click(); // 전체 삭제

    // Then: 모든 일간 반복 일정이 제거됨
    await expect(page.getByText(/일정이 삭제되었습니다/)).toBeVisible({ timeout: 3000 });

    await page.waitForTimeout(1000);
    const finalEvents = await getAllEvents();
    const finalDailyEvents = finalEvents.filter((e) => e.title === '일일 스탠드업');
    expect(finalDailyEvents.length).toBe(0);
  });

  test('월간 반복 일정을 생성하고 관리할 수 있다', async ({ page }) => {
    // Given: 사용자가 캘린더 앱에 접속
    await page.goto('http://localhost:5173/');

    // When: 월간 반복 일정 생성 (3개월간)
    await page.getByRole('textbox', { name: '제목' }).fill('월간 회고');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-01');
    await page.getByRole('textbox', { name: '시작 시간' }).fill('15:00');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('16:30');
    await page.getByRole('textbox', { name: '설명' }).fill('매월 1일 회고');

    // 반복 일정 설정
    await page.getByRole('checkbox', { name: '반복 일정' }).check();

    // 반복 유형 선택 필드가 나타날 때까지 대기
    const repeatTypeSelect = page.getByRole('combobox', { name: '반복 유형' });
    await expect(repeatTypeSelect).toBeVisible();
    await repeatTypeSelect.click();
    await page.getByRole('option', { name: 'monthly-option' }).click();

    await page.locator('#repeat-interval').fill('1');
    await page.locator('#repeat-end-date').fill('2026-01-01'); // 3개월간

    await page.getByTestId('event-submit-button').click();

    // Then: 여러 개의 월간 반복 일정이 생성됨
    // 이벤트 생성 후 UI 업데이트 대기
    await page.waitForTimeout(1000);

    const events = await getAllEvents();
    const monthlyEvents = events.filter((e) => e.title === '월간 회고');
    expect(monthlyEvents.length).toBe(3); // 11월, 12월, 1월

    // 캘린더에 표시 확인 (이벤트 로딩 대기)
    await expect(page.getByTestId('event-list')).toContainText('월간 회고', { timeout: 10000 });
    await expect(page.getByRole('button', { name: '월간 회고' }).first()).toBeVisible();

    // When: 단일 수정
    await page.locator('div:has-text("월간 회고") button[aria-label="Edit event"]').first().click();
    await expect(page.getByRole('heading', { name: '반복 일정 수정' })).toBeVisible();
    await page.getByRole('button', { name: '예' }).click(); // 단일 수정

    await page.getByRole('textbox', { name: '위치' }).fill('회의실 B');
    await page.getByTestId('event-submit-button').click();

    // Then: 한 개만 변경됨
    await expect(page.getByTestId('event-list')).toContainText('회의실 B');

    const updatedEvents = await getAllEvents();
    const eventsWithLocation = updatedEvents.filter(
      (e) => e.title === '월간 회고' && e.location === '회의실 B'
    );
    expect(eventsWithLocation.length).toBe(1);

    // UI 강제 업데이트
    await page.reload();
    await page.waitForTimeout(1000);

    // When: 수정되지 않은 반복 일정 전체 삭제
    // 12월로 이동하여 수정되지 않은 원본 이벤트에 접근
    await page.getByRole('button', { name: 'Next' }).click();
    await page.waitForTimeout(500);

    // 12월의 수정되지 않은 "월간 회고" 이벤트 삭제
    await page
      .locator('div:has-text("월간 회고") button[aria-label="Delete event"]')
      .first()
      .click();
    await expect(page.getByRole('heading', { name: '반복 일정 삭제' })).toBeVisible();
    await page.getByRole('button', { name: '아니오' }).click(); // 전체 삭제

    // Then: 수정되지 않은 반복 일정들이 모두 제거됨
    await expect(page.getByText(/일정이 삭제되었습니다/)).toBeVisible({ timeout: 3000 });

    await page.waitForTimeout(1000);
    const afterSeriesDelete = await getAllEvents();
    const remainingMonthlyEvents = afterSeriesDelete.filter((e) => e.title === '월간 회고');
    // 수정된 이벤트(회의실 B)만 남아있어야 함
    expect(remainingMonthlyEvents.length).toBe(1);
    expect(remainingMonthlyEvents[0].location).toBe('회의실 B');
  });
});
