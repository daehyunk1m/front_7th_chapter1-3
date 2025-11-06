import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import type { Event } from '../types';

interface OverlapDialogPreviewProps {
  events: Event[];
}

export const OverlapDialogPreview = ({ events }: OverlapDialogPreviewProps) => {
  const [open, setOpen] = useState(true);

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
        {events.map((event) => (
          <Typography key={event.id} sx={{ ml: 1, mb: 1 }}>
            {event.title} ({event.date} {event.startTime}-{event.endTime})
          </Typography>
        ))}
        <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>취소</Button>
        <Button color="error">계속 진행</Button>
      </DialogActions>
    </Dialog>
  );
};

export type { OverlapDialogPreviewProps };
