import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

type EventFormPreviewMode = 'create' | 'edit';

interface EventFormPreviewProps {
  mode?: EventFormPreviewMode;
  values: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
    category: string;
    repeatType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    repeatInterval: number;
    repeatEndDate?: string;
    notificationTime: number;
  };
  errors?: {
    startTime?: string;
    endTime?: string;
  };
  isRepeating?: boolean;
  disabled?: boolean;
}

const categories = ['업무', '개인', '가족', '기타'];

const repeatTypeLabels = {
  none: '반복 없음',
  daily: '매일',
  weekly: '매주',
  monthly: '매월',
  yearly: '매년',
} as const;

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
] as const;

export const EventFormPreview = ({
  mode = 'create',
  values,
  errors,
  isRepeating = false,
  disabled = false,
}: EventFormPreviewProps) => {
  const isEditMode = mode === 'edit';

  return (
    <Box
      sx={{
        width: 320,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h5">{isEditMode ? '일정 수정' : '일정 추가'}</Typography>
      <Stack spacing={2}>
        <FormControl fullWidth disabled={disabled}>
          <FormLabel htmlFor="preview-title">제목</FormLabel>
          <TextField id="preview-title" size="small" value={values.title} onChange={() => {}} />
        </FormControl>

        <FormControl fullWidth disabled={disabled}>
          <FormLabel htmlFor="preview-date">날짜</FormLabel>
          <TextField
            id="preview-date"
            size="small"
            type="date"
            value={values.date}
            onChange={() => {}}
          />
        </FormControl>

        <Stack direction="row" spacing={2}>
          <FormControl fullWidth disabled={disabled}>
            <FormLabel htmlFor="preview-start-time">시작 시간</FormLabel>
            <TextField
              id="preview-start-time"
              size="small"
              type="time"
              value={values.startTime}
              error={Boolean(errors?.startTime)}
              helperText={errors?.startTime}
              onChange={() => {}}
            />
          </FormControl>

          <FormControl fullWidth disabled={disabled}>
            <FormLabel htmlFor="preview-end-time">종료 시간</FormLabel>
            <TextField
              id="preview-end-time"
              size="small"
              type="time"
              value={values.endTime}
              error={Boolean(errors?.endTime)}
              helperText={errors?.endTime}
              onChange={() => {}}
            />
          </FormControl>
        </Stack>

        <FormControl fullWidth disabled={disabled}>
          <FormLabel htmlFor="preview-description">설명</FormLabel>
          <TextField
            id="preview-description"
            size="small"
            value={values.description}
            multiline
            onChange={() => {}}
          />
        </FormControl>

        <FormControl fullWidth disabled={disabled}>
          <FormLabel htmlFor="preview-location">위치</FormLabel>
          <TextField
            id="preview-location"
            size="small"
            value={values.location}
            onChange={() => {}}
          />
        </FormControl>

        <FormControl fullWidth disabled={disabled}>
          <FormLabel htmlFor="preview-category">카테고리</FormLabel>
          <Select id="preview-category" size="small" value={values.category} onChange={() => {}}>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox size="small" checked={isRepeating} disabled={disabled} onChange={() => {}} />
          }
          label="반복 일정"
        />

        {isRepeating && (
          <Stack spacing={2}>
            <FormControl fullWidth disabled={disabled}>
              <FormLabel htmlFor="preview-repeat-type">반복 유형</FormLabel>
              <Select
                id="preview-repeat-type"
                size="small"
                value={values.repeatType}
                onChange={() => {}}
              >
                {Object.entries(repeatTypeLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={disabled}>
              <FormLabel htmlFor="preview-repeat-interval">반복 간격</FormLabel>
              <TextField
                id="preview-repeat-interval"
                size="small"
                type="number"
                value={values.repeatInterval}
                onChange={() => {}}
              />
            </FormControl>

            <FormControl fullWidth disabled={disabled}>
              <FormLabel htmlFor="preview-repeat-end-date">반복 종료</FormLabel>
              <TextField
                id="preview-repeat-end-date"
                size="small"
                type="date"
                value={values.repeatEndDate ?? ''}
                onChange={() => {}}
              />
            </FormControl>
          </Stack>
        )}

        <FormControl fullWidth disabled={disabled}>
          <FormLabel htmlFor="preview-notification-time">알림</FormLabel>
          <Select
            id="preview-notification-time"
            size="small"
            value={values.notificationTime}
            onChange={() => {}}
          >
            {notificationOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" size="small" disabled={disabled}>
            취소
          </Button>
          <Button variant="contained" size="small" disabled={disabled}>
            {isEditMode ? '수정' : '추가'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export type { EventFormPreviewProps, EventFormPreviewMode };
