import { request } from '@playwright/test';

import { Event } from '../../../types';

/**
 * E2E 테스트 데이터베이스 초기화
 * - 기존 API를 활용하여 모든 이벤트를 삭제
 * - e2e.json을 빈 상태로 만듦
 */
export const resetTestData = async () => {
  const context = await request.newContext({
    baseURL: 'http://localhost:5173',
  });

  // 모든 이벤트 조회
  const response = await context.get('/api/events');
  const data: { events: Event[] } = await response.json();

  // 모든 이벤트 삭제
  if (data.events && data.events.length > 0) {
    for (const event of data.events) {
      await context.delete(`/api/events/${event.id}`);
    }
  }
  await context.dispose();
};

/**
 * API를 통해 테스트 이벤트 생성
 * @param event 생성할 이벤트 데이터
 * @returns 생성된 이벤트 (서버가 할당한 id 포함)
 */
export const createTestEvent = async (event: Event) => {
  const context = await request.newContext({
    baseURL: 'http://localhost:5173',
  });

  const response = await context.post('/api/events', {
    data: event,
  });

  if (!response.ok) {
    throw new Error(`Failed to create test event: ${response.statusText()}`);
  }

  const createdEvent = await response.json();
  console.log(createdEvent);
  await context.dispose();
  return createdEvent;
};

/**
 * 모든 이벤트 조회
 * @returns 현재 저장된 모든 이벤트
 */
export const getAllEvents = async () => {
  const context = await request.newContext({
    baseURL: 'http://localhost:5173',
  });

  const response = await context.get('/api/events');
  const data: { events: Event[] } = await response.json();
  console.log(data);
  await context.dispose();
  return data.events;
};
