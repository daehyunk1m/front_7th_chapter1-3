import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarPreview } from './calendar-preview';
import {
  calendarSampleEvents,
  holidaySampleMap,
  longTitleSampleEvents,
  notifiedSampleEventIds,
} from './sample-events';

const meta: Meta<typeof CalendarPreview> = {
  title: 'Visual Checklist/Calendar Preview',
  component: CalendarPreview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '캘린더 뷰 상태를 시각적으로 검증하기 위한 프리뷰 컴포넌트입니다.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof CalendarPreview>;

export const MonthView: Story = {
  name: '월간 뷰',
  args: {
    currentDate: new Date('2024-11-04'),
    view: 'month',
    events: calendarSampleEvents,
    notifiedEventIds: notifiedSampleEventIds,
    holidays: holidaySampleMap,
    title: '2024년 11월',
  },
};

export const WeekView: Story = {
  name: '주간 뷰',
  args: {
    currentDate: new Date('2024-11-04'),
    view: 'week',
    events: calendarSampleEvents,
    notifiedEventIds: notifiedSampleEventIds,
    title: '2024년 11월 1주',
  },
};

export const EventStates: Story = {
  name: '일정 상태',
  args: {
    currentDate: new Date('2024-11-04'),
    view: 'week',
    events: calendarSampleEvents.map((event) => ({
      ...event,
      date: event.date,
    })),
    notifiedEventIds: notifiedSampleEventIds,
    title: '알림/반복 아이콘 확인',
  },
};

export const LongTitles: Story = {
  name: '텍스트 길이 처리',
  args: {
    currentDate: new Date('2024-11-06'),
    view: 'month',
    events: longTitleSampleEvents,
    notifiedEventIds: [],
    title: '텍스트 오버플로우 확인',
  },
};
