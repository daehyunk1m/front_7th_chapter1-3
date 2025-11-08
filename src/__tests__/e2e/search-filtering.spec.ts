import { test, expect } from '@playwright/test';

import { resetTestData, seedTestData } from './helpers/test-helpers';

test.describe('검색 및 필터링', () => {
  // 테스트들을 순차적으로 실행하여 데이터 간섭 방지
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async () => await resetTestData());
  test.afterAll(async () => await resetTestData());

  test('사용자가 일정을 검색하고 뷰 타입에 따라 필터링된 결과를 볼 수 있다', async ({ page }) => {
    // Given: 여러 일정 생성 (제목, 설명, 위치가 다양)
    await seedTestData('search-filtering-events');
    await page.goto('/');

    // 페이지 로드 확인
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();

    // 1월로 이동 (이벤트가 2026-01에 있으므로)
    // 현재 11월 → 12월 → 1월
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByRole('heading', { name: /2025년 12월/ })).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();

    // 1월인지 확인
    await expect(page.getByRole('heading', { name: /2026년 1월/ })).toBeVisible();

    // 1월 일정이 로드되었는지 확인 (프로젝트 마감은 2월이므로 제외)
    await expect(page.getByTestId('event-list')).toContainText('팀 회의', { timeout: 5000 });
    await expect(page.getByTestId('event-list')).toContainText('개인 운동');
    await expect(page.getByTestId('event-list')).toContainText('가족 모임');
    await expect(page.getByTestId('event-list')).not.toContainText('프로젝트 마감');

    // When: 검색어 "회의" 입력
    const searchInput = page.getByRole('textbox', { name: '일정 검색' });
    await searchInput.fill('회의');

    // Then: "팀 회의"만 일정 목록에 표시
    await expect(page.getByTestId('event-list')).toContainText('팀 회의');
    await expect(page.getByTestId('event-list')).not.toContainText('개인 운동');
    await expect(page.getByTestId('event-list')).not.toContainText('가족 모임');
    await expect(page.getByTestId('event-list')).not.toContainText('프로젝트 마감');

    // And: 캘린더에도 해당 일정만 표시
    await expect(page.getByRole('button', { name: '팀 회의' }).first()).toBeVisible();

    // When: 검색어 지우기
    await searchInput.clear();

    // Then: 1월 일정 모두 표시 (프로젝트 마감은 2월이므로 제외)
    await expect(page.getByTestId('event-list')).toContainText('팀 회의', { timeout: 5000 });
    await expect(page.getByTestId('event-list')).toContainText('개인 운동');
    await expect(page.getByTestId('event-list')).toContainText('가족 모임');
    await expect(page.getByTestId('event-list')).not.toContainText('프로젝트 마감');

    // 뷰 타입 선택 combobox 찾기
    const viewTypeSelect = page.locator('[aria-label="뷰 타입 선택"]').getByRole('combobox');
    await expect(viewTypeSelect).toBeVisible();

    // When: 주간 뷰로 전환
    await viewTypeSelect.click();
    await page.getByRole('option', { name: 'week-option' }).click();

    // 주간 뷰로 변경되었는지 확인 (Week 텍스트가 표시됨)
    await expect(viewTypeSelect).toContainText('Week');
    await page.waitForTimeout(300);

    // 1월 1주에서 3주로 이동 (2026-01-15가 속한 주)
    await page.getByRole('button', { name: 'Next' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.waitForTimeout(300);

    // 3주차인지 확인
    await expect(page.getByRole('heading', { name: /2026년 1월 3주/ })).toBeVisible();

    // Then: 해당 주의 일정만 표시 (팀 회의, 개인 운동)
    // 2026-01-15가 속한 주 (1/11-1/17)의 일정만 표시
    await expect(page.getByTestId('event-list')).toContainText('팀 회의', { timeout: 5000 });
    await expect(page.getByTestId('event-list')).toContainText('개인 운동');
    await expect(page.getByTestId('event-list')).not.toContainText('가족 모임');
    await expect(page.getByTestId('event-list')).not.toContainText('프로젝트 마감');

    // When: 월간 뷰로 전환 (2026년 1월)
    await viewTypeSelect.click();
    await page.getByRole('option', { name: 'month-option' }).click();

    // Then: 해당 월의 일정만 표시 (1월 일정들)
    await expect(page.getByTestId('event-list')).toContainText('팀 회의', { timeout: 5000 });
    await expect(page.getByTestId('event-list')).toContainText('개인 운동');
    await expect(page.getByTestId('event-list')).toContainText('가족 모임');
    await expect(page.getByTestId('event-list')).not.toContainText('프로젝트 마감');

    // When: 다음 달로 이동
    await page.getByRole('button', { name: 'Next' }).click();

    // Then: 2월 일정만 표시 (프로젝트 마감)
    await expect(page.getByRole('heading', { name: /2026년 2월/ })).toBeVisible();
    await expect(page.getByTestId('event-list')).toContainText('프로젝트 마감', {
      timeout: 5000,
    });
    await expect(page.getByTestId('event-list')).not.toContainText('팀 회의');
    await expect(page.getByTestId('event-list')).not.toContainText('개인 운동');
    await expect(page.getByTestId('event-list')).not.toContainText('가족 모임');
  });
});
