import { EventForm } from '../../../types';

/**
 * Fixture 파일 구조 정의
 * - 모든 fixture JSON 파일은 이 타입을 따라야 함
 */
export interface TestFixture {
  events: EventForm[];
}

/**
 * 사용 가능한 fixture 파일명
 * - 새로운 fixture 추가 시 여기에 추가
 */
export type FixtureName =
  | 'single-event'
  | 'multiple-events'
  | 'recurring-events'
  | 'overlapping-events'
  | 'search-filtering-events';
