import { test, expect } from '@playwright/test';

import { resetTestData, createTestEvent, getAllEvents } from './helpers/test-helpers';

test.describe('반복 일정 관리 워크플로우', () => {
  test.beforeEach(async () => await resetTestData());
  test('사용자가 반복 일정을 생성하고 단일/전체 인스턴스를 수정 및 삭제할 수 있다', async () => {
    // Given: 주간 반복 일정 생성 (매주 월요일, 4주간)
    // Then: 4개의 일정 인스턴스가 캘린더에 표시됨
    // When: 두 번째 인스턴스만 수정 선택
    // Then: 해당 인스턴스만 변경되고 나머지는 유지
    // When: 전체 인스턴스 수정 선택
    // Then: 모든 인스턴스가 동일하게 변경됨
    // When: 단일 인스턴스 삭제
    // Then: 해당 인스턴스만 제거됨
    // When: 전체 인스턴스 삭제
    // Then: 모든 반복 일정이 제거됨
  });
});
