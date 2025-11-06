import { test, expect } from '@playwright/test';

import { resetTestData, seedTestData } from './helpers/test-helpers';

test.describe('일정 겹침 처리', () => {
  test.beforeEach(async () => await resetTestData());
  test.afterAll(async () => await resetTestData());

  test('새 일정 생성 시 겹침이 감지되면 경고를 받고 "계속 진행"을 선택하여 저장할 수 있다', async ({
    page,
  }) => {
    // Given: 기존 일정이 있는 상태 (회의 A: 2025-11-15 10:00-11:00)
    await seedTestData('overlapping-events');
    await page.goto('http://localhost:5173/');

    // 기존 일정 확인
    await expect(page.getByTestId('event-list')).toContainText('회의 A');

    // When: 겹치는 새 일정 생성 시도 (2025-11-15 10:30-11:30)
    await page.getByRole('textbox', { name: '제목' }).fill('새 회의');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-15');
    await page.getByRole('textbox', { name: '시작 시간' }).fill('10:30');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('11:30');
    await page.getByRole('textbox', { name: '설명' }).fill('겹치는 새 일정');
    await page.getByRole('textbox', { name: '위치' }).fill('회의실 D');
    await page.getByRole('combobox', { name: '업무' }).click();
    await page.getByRole('option', { name: '업무-option' }).click();

    await page.getByTestId('event-submit-button').click();

    // Then: 겹침 경고 다이얼로그가 표시됨
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('일정 겹침 경고')).toBeVisible();
    await expect(dialog.getByText('다음 일정과 겹칩니다:')).toBeVisible();
    await expect(dialog.getByText(/회의 A.*2025-11-15.*10:00-11:00/)).toBeVisible();
    await expect(dialog.getByText('계속 진행하시겠습니까?')).toBeVisible();

    // When: "계속 진행" 버튼 클릭
    await page.getByRole('button', { name: '계속 진행' }).click();

    // Then: 다이얼로그가 닫히고 두 일정 모두 표시됨
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByTestId('event-list')).toContainText('회의 A');
    await expect(page.getByTestId('event-list')).toContainText('새 회의');
    await expect(page.getByTestId('event-list')).toContainText('10:30 - 11:30');
  });

  test('새 일정 생성 시 겹침이 감지되면 경고를 받고 "취소"를 선택하여 생성을 중단할 수 있다', async ({
    page,
  }) => {
    // Given: 기존 일정이 있는 상태 (회의 A: 2025-11-15 10:00-11:00)
    await seedTestData('overlapping-events');
    await page.goto('http://localhost:5173/');

    // 기존 일정 확인
    await expect(page.getByTestId('event-list')).toContainText('회의 A');

    // When: 겹치는 새 일정 생성 시도 (2025-11-15 10:15-10:45)
    await page.getByRole('textbox', { name: '제목' }).fill('취소할 회의');
    await page.getByRole('textbox', { name: '날짜' }).fill('2025-11-15');
    await page.getByRole('textbox', { name: '시작 시간' }).fill('10:15');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('10:45');
    await page.getByRole('textbox', { name: '설명' }).fill('생성되지 않을 일정');
    await page.getByRole('textbox', { name: '위치' }).fill('회의실 E');
    await page.getByRole('combobox', { name: '업무' }).click();
    await page.getByRole('option', { name: '개인-option' }).click();

    await page.getByTestId('event-submit-button').click();

    // Then: 겹침 경고 다이얼로그가 표시됨
    const cancelDialog = page.getByRole('dialog');
    await expect(cancelDialog).toBeVisible();
    await expect(cancelDialog.getByText('일정 겹침 경고')).toBeVisible();
    await expect(cancelDialog.getByText(/회의 A.*2025-11-15.*10:00-11:00/)).toBeVisible();

    // When: "취소" 버튼 클릭
    await cancelDialog.getByRole('button', { name: '취소' }).click();

    // Then: 다이얼로그가 닫히고 새 일정은 생성되지 않음
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByTestId('event-list')).toContainText('회의 A');
    await expect(page.getByTestId('event-list')).not.toContainText('취소할 회의');

    // 폼이 유지되어 있는지 확인 (사용자가 수정 후 재시도 가능)
    await expect(page.getByRole('textbox', { name: '제목' })).toHaveValue('취소할 회의');
  });

  test('일정 수정 시 겹침이 발생하면 경고를 받고 "계속 진행"을 선택하여 수정할 수 있다', async ({
    page,
  }) => {
    // Given: 기존 일정들이 있는 상태 (회의 A: 10:00-11:00, 회의 C: 14:00-15:00)
    await seedTestData('overlapping-events');
    await page.goto('http://localhost:5173/');

    // 기존 일정 확인
    await expect(page.getByTestId('event-list')).toContainText('회의 A');
    await expect(page.getByTestId('event-list')).toContainText('회의 C');
    await expect(page.getByTestId('event-list')).toContainText('14:00 - 15:00');

    // When: 회의 C를 수정하여 회의 A와 겹치게 변경 (14:00-15:00 → 10:30-11:30)
    const eventCItem = page.locator('[data-testid="event-list"]').filter({ hasText: '회의 C' });

    await eventCItem.getByRole('button', { name: 'Edit event' }).first().click();
    await expect(page.getByTestId('event-submit-button')).toContainText('일정 수정');

    // 시간 수정
    await page.getByRole('textbox', { name: '시작 시간' }).fill('10:30');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('11:30');

    await page.getByTestId('event-submit-button').click();

    // Then: 겹침 경고 다이얼로그가 표시됨
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('일정 겹침 경고')).toBeVisible();
    await expect(dialog.getByText(/회의 A.*2025-11-15.*10:00-11:00/)).toBeVisible();

    // When: "계속 진행" 버튼 클릭
    await dialog.getByRole('button', { name: '계속 진행' }).click();

    // Then: 다이얼로그가 닫히고 일정이 수정됨
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByTestId('event-list')).toContainText('회의 C');
    await expect(page.getByTestId('event-list')).toContainText('10:30 - 11:30');

    // 수정된 시간으로 표시되는지 확인
    const updatedEventC = page.locator('[data-testid="event-list"]').filter({ hasText: '회의 C' });
    await expect(updatedEventC.first()).toContainText('10:30 - 11:30');
  });

  test('일정 수정 시 겹침이 발생하면 경고를 받고 "취소"를 선택하여 수정을 중단할 수 있다', async ({
    page,
  }) => {
    // Given: 기존 일정들이 있는 상태 (회의 A: 10:00-11:00, 회의 C: 14:00-15:00)
    await seedTestData('overlapping-events');
    await page.goto('http://localhost:5173/');

    // 기존 일정 확인
    await expect(page.getByTestId('event-list')).toContainText('회의 A');
    await expect(page.getByTestId('event-list')).toContainText('회의 C');

    const originalEventC = page.locator('[data-testid="event-list"]').filter({ hasText: '회의 C' });
    await expect(originalEventC.first()).toContainText('14:00 - 15:00');

    // When: 회의 C를 수정하여 회의 A와 겹치게 시도 (14:00-15:00 → 09:30-10:30)
    await originalEventC.getByRole('button', { name: 'Edit event' }).first().click();
    await expect(page.getByTestId('event-submit-button')).toContainText('일정 수정');

    // 시간 수정
    await page.getByRole('textbox', { name: '시작 시간' }).fill('09:30');
    await page.getByRole('textbox', { name: '종료 시간' }).fill('10:30');

    await page.getByTestId('event-submit-button').click();

    // Then: 겹침 경고 다이얼로그가 표시됨
    const editCancelDialog = page.getByRole('dialog');
    await expect(editCancelDialog).toBeVisible();
    await expect(editCancelDialog.getByText('일정 겹침 경고')).toBeVisible();
    await expect(editCancelDialog.getByText(/회의 A.*2025-11-15.*10:00-11:00/)).toBeVisible();

    // When: "취소" 버튼 클릭
    await editCancelDialog.getByRole('button', { name: '취소' }).click();

    // Then: 다이얼로그가 닫히고 일정이 수정되지 않음 (원래 시간 유지)
    await expect(page.getByRole('dialog')).not.toBeVisible();

    const unchangedEventC = page.locator('[data-testid="event-list"]').filter({ hasText: '회의 C' });
    await expect(unchangedEventC.first()).toContainText('14:00 - 15:00');
    await expect(unchangedEventC.first()).not.toContainText('09:30 - 10:30');

    // 편집 폼이 유지되어 있는지 확인
    await expect(page.getByRole('textbox', { name: '시작 시간' })).toHaveValue('09:30');
    await expect(page.getByRole('textbox', { name: '종료 시간' })).toHaveValue('10:30');
  });
});
