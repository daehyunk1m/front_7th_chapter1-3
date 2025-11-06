import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { request } from '@playwright/test';

import { Event, EventForm } from '../../../types';
import { FixtureName, TestFixture } from '../fixtures/types';

/**
 * E2E 테스트 데이터베이스 초기화
 * - 기존 API를 활용하여 모든 이벤트를 삭제
 * - e2e.json을 빈 상태로 만듦
 */
export const resetTestData = async () => {
  const context = await request.newContext({
    baseURL: 'http://localhost:3000',
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
 * @param event 생성할 이벤트 데이터 (id 없이)
 * @returns 생성된 이벤트 (서버가 할당한 id 포함)
 */
export const createTestEvent = async (event: EventForm) => {
  const context = await request.newContext({
    baseURL: 'http://localhost:3000',
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
    baseURL: 'http://localhost:3000',
  });

  const response = await context.get('/api/events');
  const data: { events: Event[] } = await response.json();
  console.log(data);
  await context.dispose();
  return data.events;
};

/**
 * Fixture 파일을 읽어서 테스트 데이터를 일괄 생성
 * @param fixtureName fixture 파일명 (확장자 제외)
 * @returns 생성된 이벤트 배열
 */
export const seedTestData = async (fixtureName: FixtureName): Promise<Event[]> => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const fixturePath = join(__dirname, '../fixtures', `${fixtureName}.json`);
  const fixtureContent = readFileSync(fixturePath, 'utf-8');
  const fixtureData: TestFixture = JSON.parse(fixtureContent);

  const context = await request.newContext({
    baseURL: 'http://localhost:3000',
  });

  const createdEvents: Event[] = [];

  // 각 이벤트를 순차적으로 생성
  for (const event of fixtureData.events) {
    // 반복 이벤트인 경우 /api/events-list 사용
    if (event.repeat.type !== 'none') {
      const response = await context.post('/api/events-list', {
        data: [event],
      });

      if (!response.ok) {
        throw new Error(`Failed to create recurring event: ${response.statusText()}`);
      }

      const created = await response.json();
      createdEvents.push(...created);
    } else {
      // 단일 이벤트는 /api/events 사용
      const response = await context.post('/api/events', {
        data: event,
      });

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.statusText()}`);
      }

      const created = await response.json();
      createdEvents.push(created);
    }
  }

  await context.dispose();
  console.log(`Seeded ${createdEvents.length} events from ${fixtureName}.json`);
  return createdEvents;
};

/**
 * 특정 이벤트 수정
 * @param id 수정할 이벤트 ID
 * @param partialData 수정할 필드 (일부만 전달 가능)
 * @returns 수정된 이벤트
 */
export const updateTestEvent = async (
  id: string,
  partialData: Partial<EventForm>
): Promise<Event> => {
  const context = await request.newContext({
    baseURL: 'http://localhost:3000',
  });

  // 기존 이벤트 조회
  const getResponse = await context.get(`/api/events`);
  const { events }: { events: Event[] } = await getResponse.json();
  const existingEvent = events.find((e) => e.id === id);

  if (!existingEvent) {
    throw new Error(`Event with id ${id} not found`);
  }

  // 기존 데이터와 병합
  const updatedData = {
    ...existingEvent,
    ...partialData,
  };

  const response = await context.put(`/api/events/${id}`, {
    data: updatedData,
  });

  if (!response.ok) {
    throw new Error(`Failed to update event: ${response.statusText()}`);
  }

  const updatedEvent = await response.json();
  console.log(`Updated event ${id}:`, updatedEvent);
  await context.dispose();
  return updatedEvent;
};

/**
 * 특정 이벤트 삭제
 * @param id 삭제할 이벤트 ID
 */
export const deleteTestEvent = async (id: string): Promise<void> => {
  const context = await request.newContext({
    baseURL: 'http://localhost:3000',
  });

  const response = await context.delete(`/api/events/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to delete event: ${response.statusText()}`);
  }

  console.log(`Deleted event ${id}`);
  await context.dispose();
};

/**
 * 제목으로 이벤트 찾기
 * @param title 찾을 이벤트 제목
 * @returns 찾은 이벤트 (없으면 undefined)
 */
export const findEventByTitle = async (title: string): Promise<Event | undefined> => {
  const events = await getAllEvents();
  return events.find((event) => event.title === title);
};
