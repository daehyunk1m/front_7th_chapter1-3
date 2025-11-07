import type { Meta, StoryObj } from '@storybook/react-vite';

import { OverlapDialogPreview } from './overlap-dialog-preview';
import { calendarSampleEvents } from './sample-events';

const meta: Meta<typeof OverlapDialogPreview> = {
  title: 'Components/OverlapDialogPreview',
  component: OverlapDialogPreview,
  parameters: {
    docs: {
      description: {
        component: '일정 겹침 경고 다이얼로그의 UI 상태를 확인합니다.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof OverlapDialogPreview>;

export const MultipleConflicts: Story = {
  args: {
    events: calendarSampleEvents.slice(0, 3),
  },
};

export const SingleConflict: Story = {
  args: {
    events: [calendarSampleEvents[0]],
  },
};
