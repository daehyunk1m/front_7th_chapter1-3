import { test, expect } from '@playwright/test';

import { resetTestData, seedTestData } from './helpers/test-helpers';

test.describe('알림 시스템', () => {
  test.beforeEach(async () => await resetTestData());
  test.afterAll(async () => await resetTestData());

  test('사용자가 설정한 알림 시간에 따라 일정 알림이 표시되고 시각적 표시가 적용된다', async () => {
    // Given: 1분 후 시작하는 일정 생성 (알림: 1분 전)
    // When: 1분 대기
    // Then: 화면 우측 상단에 알림 팝업 표시
    // And: 해당 일정에 빨간색 배경 적용
    // And: 종 아이콘 표시
    // Given: 다양한 알림 시간 설정 (10분, 1시간, 2시간, 1일)
    // Then: 각 알림 시간에 맞춰 알림 표시
    // When: 알림 닫기
    // Then: 알림 팝업 제거 (빨간 배경과 종 아이콘은 유지)
  });
});
