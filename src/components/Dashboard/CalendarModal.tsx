import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Paper,
  useTheme,
  Grid,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Event as EventIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

interface CalendarModalProps {
  open: boolean;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <EventIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Calendar
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ width: '100%' }}>
          {/* Month and Year Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
            <IconButton onClick={handlePrevMonth} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6">
              {monthName} {year}
            </Typography>
            <IconButton onClick={handleNextMonth} size="small">
              <ChevronRightIcon />
            </IconButton>
          </Box>

          {/* Week Days Header */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {weekDays.map((day) => (
              <Grid item xs key={day}>
                <Typography
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                  }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar Grid */}
          <Grid container spacing={1}>
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <Grid item xs key={`empty-${index}`}>
                <Box sx={{ p: 1 }} />
              </Grid>
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isToday = 
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <Grid item xs key={day}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      bgcolor: isToday ? 'primary.main' : 'transparent',
                      color: isToday ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: isToday ? 'primary.dark' : 'action.hover',
                      },
                    }}
                  >
                    <Typography>{day}</Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarModal;
