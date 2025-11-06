import { test, expect } from '@playwright/test';

import { resetTestData, seedTestData } from './helpers/test-helpers';

test.describe('검색 및 필터링', () => {
  test.beforeEach(async () => await resetTestData());
  test.afterAll(async () => await resetTestData());

  test('사용자가 일정을 검색하고 뷰 타입에 따라 필터링된 결과를 볼 수 있다', async () => {
    // Given: 여러 일정 생성 (제목, 설명, 위치가 다양)
    //   - "팀 회의" (2025-01-15)
    //   - "개인 운동" (2025-01-16)
    //   - "가족 모임" (2025-01-22)
    //   - "프로젝트 마감" (2025-02-01)
    // When: 검색어 "회의" 입력
    // Then: "팀 회의"만 일정 목록에 표시
    // And: 캘린더에도 해당 일정만 표시
    // When: 검색어 지우기
    // Then: 모든 일정 표시
    // When: 주간 뷰로 전환 (2025-01-15 주)
    // Then: 해당 주의 일정만 표시 (팀 회의, 개인 운동)
    // When: 월간 뷰로 전환 (2025년 1월)
    // Then: 해당 월의 일정만 표시 (1월 일정들)
    // When: 다음 달로 이동
    // Then: 2월 일정만 표시 (프로젝트 마감)
  });
});
