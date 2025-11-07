import type { Event } from '../types';

/**
 * Storybook 시각적 회귀 테스트용 고정 기준 날짜
 *
 * 이 날짜는 Chromatic 스냅샷 비교 시 일관성을 보장하기 위해 고정되어 있습니다.
 * 변경 시 모든 스토리의 시각적 스냅샷이 변경되므로 신중하게 결정해야 합니다.
 *
 * @constant
 */
export const STORYBOOK_BASE_DATE = new Date('2024-11-04T00:00:00');

const splitTime = (time: string) => {
  const [start, end] = time.split('/');
  return {
    startTime: start,
    endTime: end ?? start,
  };
};

const baseDate = STORYBOOK_BASE_DATE;

const format = (offsetDays: number, time: string) => {
  const date = new Date(baseDate);
  date.setDate(baseDate.getDate() + offsetDays);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return {
    date: `${yyyy}-${mm}-${dd}`,
    ...splitTime(time),
  };
};

export const calendarSampleEvents: Event[] = [
  {
    id: 'event-1',
    title: '주간 팀 미팅',
    description: '전사 프로젝트 동기화',
    location: '회의실 A',
    category: '업무',
    notificationTime: 10,
    repeat: { type: 'weekly', interval: 1 },
    ...format(0, '10:00/11:00'),
  },
  {
    id: 'event-2',
    title: '디자인 검토 회의',
    description: '캠페인 런칭 준비',
    location: '회의실 B',
    category: '업무',
    notificationTime: 60,
    repeat: { type: 'none', interval: 0 },
    ...format(1, '14:00/15:00'),
  },
  {
    id: 'event-3',
    title: '개인 헬스 트레이닝',
    description: 'PT with Jay',
    location: '헬스장',
    category: '개인',
    notificationTime: 120,
    repeat: { type: 'daily', interval: 1 },
    ...format(2, '07:30/08:30'),
  },
  {
    id: 'event-4',
    title: '반복 이벤트 긴 제목 예시로 자리가 어떻게 처리되는지 확인합니다',
    description: '긴 제목이 잘리는지 확인',
    location: '온라인',
    category: '업무',
    notificationTime: 0,
    repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
    ...format(3, '16:00/17:30'),
  },
] as const;

export const notifiedSampleEventIds = ['event-1', 'event-3'];

export const holidaySampleMap: Record<string, string> = {
  '2024-11-05': '사내 워크샵',
};

export const longTitleSampleEvents: Event[] = [
  {
    id: 'event-long-1',
    title: '셀 텍스트가 매우 길어지는 경우를 테스트하기 위한 초장문의 일정 제목입니다',
    description: '길이 테스트',
    location: '온라인',
    category: '업무',
    notificationTime: 10,
    repeat: { type: 'none', interval: 0 },
    date: '2024-11-08',
    startTime: '09:00',
    endTime: '10:00',
  },
  {
    id: 'event-long-2',
    title: '모바일에서도 줄바꿈 없이 말줄임 적용되는지 확인',
    description: 'responsive',
    location: '회의실',
    category: '개인',
    notificationTime: 0,
    repeat: { type: 'none', interval: 0 },
    date: '2024-11-08',
    startTime: '11:00',
    endTime: '12:00',
  },
] as const;
