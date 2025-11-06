import { Notifications, Repeat } from '@mui/icons-material';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type { Event, RepeatType } from '../types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from '../utils/dateUtils';

type CalendarViewType = 'month' | 'week';

interface CalendarPreviewProps {
  currentDate: Date;
  view: CalendarViewType;
  events: Event[];
  holidays?: Record<string, string>;
  notifiedEventIds?: string[];
  title?: string;
}

const eventBoxStyles = {
  notified: {
    backgroundColor: '#ffebee',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  normal: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'normal',
    color: 'inherit',
  },
  common: {
    padding: 4,
    marginTop: 4,
    borderRadius: 4,
    minHeight: 18,
    width: '100%',
    overflow: 'hidden',
    display: 'inline-block',
  },
} as const;

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const getRepeatTypeLabel = (type: RepeatType): string => {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
};

const isSameDay = (date: Date, targetIso: string) => {
  const target = new Date(targetIso);
  return date.toDateString() === target.toDateString();
};

const filterEventsByMonth = (events: Event[], baseDate: Date) => {
  return events.filter((event) => {
    const target = new Date(event.date);
    return (
      target.getFullYear() === baseDate.getFullYear() && target.getMonth() === baseDate.getMonth()
    );
  });
};

const renderEventItem = (
  event: Event,
  isNotified: boolean,
  shouldShowRepeat: boolean,
  key?: string
) => {
  return (
    <Box
      key={key ?? event.id}
      sx={{
        ...eventBoxStyles.common,
        ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
      }}
    >
      <Stack direction="row" spacing={0.5} alignItems="center">
        {isNotified && <Notifications fontSize="small" />}
        {shouldShowRepeat && (
          <Repeat
            fontSize="small"
            titleAccess={`${event.repeat.interval}${getRepeatTypeLabel(
              event.repeat.type
            )}마다 반복`}
          />
        )}
        <Typography
          component="span"
          variant="caption"
          noWrap
          sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
        >
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
};

const renderWeekView = (
  currentDate: Date,
  events: Event[],
  notifiedEventIds: string[] | undefined,
  title?: string
) => {
  const weekDates = getWeekDates(new Date(currentDate));

  return (
    <Stack spacing={4} sx={{ width: '100%' }}>
      <Typography variant="h5">{title ?? formatWeek(currentDate)}</Typography>
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {weekDays.map((day) => (
                <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {weekDates.map((date) => {
                const dayEvents = events.filter((event) => isSameDay(date, event.date));
                return (
                  <TableCell
                    key={date.toISOString()}
                    sx={{
                      height: '120px',
                      verticalAlign: 'top',
                      width: '14.28%',
                      padding: 1,
                      border: '1px solid #e0e0e0',
                      overflow: 'hidden',
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {date.getDate()}
                    </Typography>
                    {dayEvents.map((event) => {
                      const isNotified = notifiedEventIds?.includes(event.id) ?? false;
                      const isRepeating = event.repeat.type !== 'none';
                      return renderEventItem(event, isNotified, isRepeating, event.id);
                    })}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

const renderMonthView = (
  currentDate: Date,
  events: Event[],
  holidays: Record<string, string> | undefined,
  notifiedEventIds: string[] | undefined,
  title?: string
) => {
  const weeks = getWeeksAtMonth(new Date(currentDate));
  const monthEvents = filterEventsByMonth(events, currentDate);

  return (
    <Stack spacing={4} sx={{ width: '100%' }}>
      <Typography variant="h5">{title ?? formatMonth(currentDate)}</Typography>
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {weekDays.map((day) => (
                <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {weeks.map((week, weekIndex) => (
              <TableRow key={weekIndex}>
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return (
                      <TableCell
                        key={`empty-${weekIndex}-${dayIndex}`}
                        sx={{
                          height: '120px',
                          width: '14.28%',
                          padding: 1,
                          border: '1px solid #e0e0e0',
                          backgroundColor: '#fafafa',
                        }}
                      />
                    );
                  }

                  const dateString = formatDate(currentDate, day);
                  const holidayName = holidays?.[dateString];
                  const dayEvents = getEventsForDay(monthEvents, day);

                  return (
                    <TableCell
                      key={`day-${weekIndex}-${dayIndex}`}
                      sx={{
                        height: '120px',
                        verticalAlign: 'top',
                        width: '14.28%',
                        padding: 1,
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {day}
                      </Typography>
                      {holidayName && (
                        <Typography variant="body2" color="error">
                          {holidayName}
                        </Typography>
                      )}
                      {dayEvents.map((event) => {
                        const isNotified = notifiedEventIds?.includes(event.id) ?? false;
                        const isRepeating = event.repeat.type !== 'none';
                        return renderEventItem(event, isNotified, isRepeating, event.id);
                      })}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export const CalendarPreview = ({
  currentDate,
  view,
  events,
  holidays,
  notifiedEventIds,
  title,
}: CalendarPreviewProps) => {
  if (view === 'week') {
    return renderWeekView(currentDate, events, notifiedEventIds, title);
  }

  return renderMonthView(currentDate, events, holidays, notifiedEventIds, title);
};

export type { CalendarPreviewProps, CalendarViewType };
