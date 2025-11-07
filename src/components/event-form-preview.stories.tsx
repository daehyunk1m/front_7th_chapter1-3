import type { Meta, StoryObj } from '@storybook/react-vite';

import { EventFormPreview } from './event-form-preview';
import { STORYBOOK_BASE_DATE } from './sample-events';

const formatDateString = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const baseFormValues = {
  title: '팀 미팅',
  date: formatDateString(STORYBOOK_BASE_DATE),
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 동기화 미팅',
  location: '회의실 A',
  category: '업무',
  repeatType: 'weekly' as const,
  repeatInterval: 1,
  repeatEndDate: '2024-12-31',
  notificationTime: 10,
};

const meta: Meta<typeof EventFormPreview> = {
  title: 'Components/EventFormPreview',
  component: EventFormPreview,
  parameters: {
    docs: {
      description: {
        component: '일정 생성/수정 폼의 다양한 상태를 확인하기 위한 프리뷰입니다.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof EventFormPreview>;

export const CreateForm: Story = {
  name: '신규 일정 폼',
  args: {
    mode: 'create',
    values: {
      ...baseFormValues,
      title: '',
      description: '',
      notificationTime: 60,
    },
    isRepeating: false,
  },
};

export const EditForm: Story = {
  name: '반복 일정 수정 폼',
  args: {
    mode: 'edit',
    values: baseFormValues,
    isRepeating: true,
  },
};

export const ValidationErrorState: Story = {
  name: '시간 검증 오류',
  args: {
    mode: 'create',
    values: {
      ...baseFormValues,
      startTime: '15:00',
      endTime: '14:00',
    },
    errors: {
      startTime: '시작 시간이 종료 시간보다 늦습니다.',
      endTime: '종료 시간을 다시 확인해주세요.',
    },
    isRepeating: false,
  },
};

export const DisabledState: Story = {
  name: '비활성화 폼',
  args: {
    mode: 'edit',
    values: baseFormValues,
    isRepeating: true,
    disabled: true,
  },
};
