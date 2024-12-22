import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Stack,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { collection, addDoc, query, where, getDocs, /*Timestamp*/ } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  userId: string;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<{ [key: string]: CalendarEvent[] }>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const { currentUser } = useAuth();

  const fetchEvents = async () => {
    if (!currentUser) return;

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const eventsQuery = query(
      collection(firestore, 'calendar_events'),
      where('userId', '==', currentUser.uid),
      where('date', '>=', startOfMonth.toISOString()),
      where('date', '<=', endOfMonth.toISOString())
    );

    try {
      const querySnapshot = await getDocs(eventsQuery);
      const newEvents: { [key: string]: CalendarEvent[] } = {};
      
      querySnapshot.forEach((doc) => {
        const event = { id: doc.id, ...doc.data() } as CalendarEvent;
        const dateKey = event.date.split('T')[0];
        if (!newEvents[dateKey]) {
          newEvents[dateKey] = [];
        }
        newEvents[dateKey].push(event);
      });
      
      setEvents(newEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, currentUser]);

  const handleAddEvent = async () => {
    if (!selectedDate || !currentUser || !newEventTitle.trim()) return;

    try {
      const eventData = {
        title: newEventTitle.trim(),
        date: selectedDate.toISOString(),
        userId: currentUser.uid,
      };

      await addDoc(collection(firestore, 'calendar_events'), eventData);
      await fetchEvents();
      
      setNewEventTitle('');
      setIsAddEventOpen(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsAddEventOpen(true);
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
  
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ p: 2 }} />);
    }
  
    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const currentDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateKey = currentDateObj.toISOString().split('T')[0];
      const dayEvents = events[dateKey] || [];
      const hasEvents = dayEvents.length > 0;
      
      const isToday = 
        new Date().getDate() === day && 
        new Date().getMonth() === currentDate.getMonth() && 
        new Date().getFullYear() === currentDate.getFullYear();
  
      days.push(
        <Box 
          key={day} 
          onClick={() => handleDateClick(currentDateObj)}
          sx={{ 
            p: 2, 
            height: '100%',
            bgcolor: isToday ? 'primary.light' : 'transparent',
            color: isToday ? 'white' : 'inherit',
            borderRadius: 1,
            position: 'relative',
            '&:hover': {
              bgcolor: 'action.hover',
              cursor: 'pointer'
            },
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Typography>{day}</Typography>
            {hasEvents && (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: -2,
                  right: -2
                }}
              />
            )}
          </Box>
          <Stack spacing={0.5}>
            {dayEvents.map((event, index) => (
              <Chip
                key={event.id}
                label={event.title}
                size="small"
                color="primary"
                sx={{ maxWidth: '100%' }}
              />
            ))}
          </Stack>
        </Box>
      );
    }
  
    return days;
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton onClick={handlePrevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Grid container columns={7} sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Grid item key={day}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2">{day}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Grid container columns={7} sx={{ mt: 1 }}>
        {renderCalendarDays().map((day, index) => (
          <Grid item key={index}>
            {day}
          </Grid>
        ))}
      </Grid>

      <Dialog open={isAddEventOpen} onClose={() => setIsAddEventOpen(false)}>
        <DialogTitle>Add Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Title"
            fullWidth
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
          <Button onClick={handleAddEvent} variant="contained" color="primary">
            Add Event
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Calendar;
