import type { Meta, StoryObj } from '@storybook/react-vite';

import RecurringEventDialog from './RecurringEventDialog';

/**
 * Meta information for the RecurringEventDialog component stories
 * This defines the component's Storybook configuration
 */
const meta: Meta<typeof RecurringEventDialog> = {
  title: 'Components/RecurringEventDialog',
  component: RecurringEventDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '반복 일정의 수정 또는 삭제 시 단일 인스턴스 또는 전체 시리즈 중 선택할 수 있는 다이얼로그 컴포넌트입니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: '다이얼로그 열림 상태',
    },
    mode: {
      control: 'select',
      options: ['edit', 'delete'],
      description: '다이얼로그 모드 (수정 또는 삭제)',
    },
    onClose: {
      action: 'closed',
      description: '다이얼로그 닫기 콜백',
    },
    onConfirm: {
      action: 'confirmed',
      description: '확인 버튼 클릭 콜백 (editSingleOnly: boolean)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RecurringEventDialog>;

/**
 * 기본 수정 모드 다이얼로그
 */
export const EditMode: Story = {
  args: {
    open: true,
    mode: 'edit',
    event: {
      id: '1',
      title: '팀 미팅',
      date: '2024-11-04',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-31',
      },
      notificationTime: 10,
    },
    onClose: () => {},
    onConfirm: () => {},
  },
};

/**
 * 삭제 모드 다이얼로그
 */
export const DeleteMode: Story = {
  args: {
    open: true,
    mode: 'delete',
    event: {
      id: '2',
      title: '운동',
      date: '2024-11-04',
      startTime: '07:00',
      endTime: '08:00',
      description: '조깅',
      location: '공원',
      category: '개인',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 60,
    },
    onClose: () => {},
    onConfirm: () => {},
  },
};

/**
 * 닫힌 상태의 다이얼로그
 */
export const Closed: Story = {
  args: {
    open: false,
    mode: 'edit',
    event: null,
    onClose: () => {},
    onConfirm: () => {},
  },
};

/**
 * 상호작용 예시 - 실제 동작을 확인할 수 있는 스토리
 */
export const Interactive: Story = {
  args: {
    open: true,
    mode: 'edit',
    event: {
      id: '3',
      title: '반복 일정 예시',
      date: '2024-11-04',
      startTime: '14:00',
      endTime: '15:00',
      description: '이 스토리에서 버튼을 클릭하면 Actions 탭에서 이벤트를 확인할 수 있습니다.',
      location: '온라인',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-12-31',
      },
      notificationTime: 120,
    },
    onClose: () => {},
    onConfirm: () => {},
  },
};
