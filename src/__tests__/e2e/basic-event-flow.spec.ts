import { test, expect } from '@playwright/test';

import { resetTestData, createTestEvent, getAllEvents } from './helpers/test-helpers';

test.describe('기본 일정 관리 워크플로우', () => {
  // beforeEach에서 모든 이벤트 삭제
  test.beforeEach(async () => await resetTestData());
  // Given: 사용자가 캘린더 앱에 접속
  // When: 새 일정 폼을 작성하고 제출
  // Then: 일정이 캘린더 뷰와 일정 리스트에 표시됨
  // When: 일정을 클릭하여 수정
  // Then: 수정된 내용이 반영됨
  // When: 일정을 삭제
  // Then: 일정이 더 이상 표시되지 않음
  test('페이지가 정상적으로 로드된다.', async ({ page }) => {
    await page.goto('/');

    // 주요 요소 표시되는지 확인
    await expect(page.getByText('일정 추가')).toBeVisible();
    await expect(page.getByText('일정 보기')).toBeVisible();
    await expect(page.getByText('일정 검색')).toBeVisible();
  });

  test('새로운 일정을 추가할 수 있다.', async ({ page }) => {
    await page.goto('/');

    // given - 일정 폼에 데이터 입력
    await page.getByRole('textbox', { name: '제목' }).fill('테스트 일정');
    await page.getByLabelText('제목').fill('테스트 일정');
    await page.getByLabelText('날짜').fill('2025-11-05');
    await page.getByLabelText('시작 시간').fill('10:00');
    await page.getByLabelText('종료 시간').fill('11:00');
    await page.getByLabelText('설명').fill('테스트 일정 설명');
    await page.getByLabelText('위치').fill('테스트 일정 위치');
    await page.getByLabelText('카테고리').click();
    await page.getByRole('option', { name: '업무-option' }).click();

    // when - 일정 추가 버튼 클릭

    // then - 일정 추가 성공
  });
  test('생성된 일정을 조회할 수 있다.', async ({ page }) => {
    await page.goto('/');
  });
  test('생성된 일정을 수정할 수 있다.', async ({ page }) => {
    await page.goto('/');
  });

  test('생성된 일정을 삭제할 수 있다.', async ({ page }) => {
    await page.goto('/');
  });

  test('기본 일정 플로우: C->R->U->D', async ({ page }) => {});
  // 모든 테스트 종료 후 모든 이벤트 초기화
  test.afterAll(async () => await resetTestData());
});
