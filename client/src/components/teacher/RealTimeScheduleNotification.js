import React, { useState, useEffect } from 'react';
import { Clock, Bell, BookOpen, MapPin, Calendar } from 'lucide-react';

function RealTimeScheduleNotification({ user }) {
  const [currentClass, setCurrentClass] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayOrder, setDayOrder] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [notification, setNotification] = useState(null);

  const periods = [
    { number: 1, start: '09:15', end: '10:05' },
    { number: 2, start: '10:05', end: '10:55' },
    { number: 3, start: '11:05', end: '11:55' },
    { number: 4, start: '11:55', end: '12:45' },
    { number: 5, start: '13:25', end: '14:10' },
    { number: 6, start: '14:10', end: '15:05' },
    { number: 7, start: '15:15', end: '16:00' },
    { number: 8, start: '16:00', end: '16:45' }
  ];

  const dayNames = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
  
  const getDayOrder = (dayOfWeek) => {
    const days = ['1', '2', '3', '4', '5'];
    return days[dayOfWeek] || dayOfWeek;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateClassStatus();
    }, 30000); // Update every 30 seconds

    calculateDayOrder();
    fetchTodaySchedule();
    return () => clearInterval(timer);
  }, []);

  const calculateDayOrder = () => {
    const dayOfWeek = selectedDate.getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      setDayOrder(null);
      return;
    }

    // If you have P3: CCS346(L) on Day I, then the timetable uses 0-based indexing
    // where Day I = 0, Day II = 1, etc.
    const dayOrderNumber = dayOfWeek - 1; // Monday=0(Day I), Tuesday=1(Day II), etc.
    console.log('Selected date:', selectedDate.toDateString(), 'Day of week:', dayOfWeek, 'Day order:', dayOrderNumber);
    setDayOrder(dayOrderNumber);
  };

  const fetchTodaySchedule = async () => {
    try {
      if (dayOrder === null) return;
      
      // Fetch actual timetable data like TimetableManagement
      const response = await fetch(`http://localhost:5000/api/timetables?day_of_week=${dayOrder}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const allTimetables = await response.json();
        console.log('All timetables for day', dayOrder, ':', allTimetables);
        
        // Filter by teacher's staff_id AND selected day
        const teacherSchedule = allTimetables.filter(entry => {
          console.log('Checking entry:', entry.staff_id, entry.day_of_week, 'vs teacher:', user?.staff_id, 'day:', dayOrder);
          return entry.staff_id === user?.staff_id && entry.day_of_week === dayOrder;
        });
        
        console.log('Teacher schedule found:', teacherSchedule);
        setTodaySchedule(teacherSchedule);
      }
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    }
  };

  useEffect(() => {
    calculateDayOrder();
  }, [selectedDate]);

  useEffect(() => {
    if (dayOrder !== null) {
      fetchTodaySchedule();
    }
  }, [dayOrder, user?.staff_id]);

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const updateClassStatus = () => {
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    let current = null;
    let next = null;

    const sortedSchedule = todaySchedule.sort((a, b) => a.period_number - b.period_number);

    for (let i = 0; i < sortedSchedule.length; i++) {
      const classItem = sortedSchedule[i];
      const period = periods.find(p => p.number === classItem.period_number);
      
      if (!period) continue;

      const startMinutes = timeToMinutes(period.start);
      const endMinutes = timeToMinutes(period.end);

      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        current = { ...classItem, period };
        next = sortedSchedule[i + 1] ? { 
          ...sortedSchedule[i + 1], 
          period: periods.find(p => p.number === sortedSchedule[i + 1].period_number) 
        } : null;
        break;
      } else if (currentMinutes < startMinutes) {
        next = { ...classItem, period };
        break;
      }
    }

    setCurrentClass(current);
    setNextClass(next);
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTimeUntilNext = () => {
    if (!nextClass?.period) return null;
    
    const nextStartMinutes = timeToMinutes(nextClass.period.start);
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const diffMinutes = nextStartMinutes - currentMinutes;
    
    if (diffMinutes <= 0) return null;
    
    // Show notification 60 minutes before class (for testing)
    if (diffMinutes <= 60 && diffMinutes > 0) {
      setNotification({
        type: 'upcoming',
        message: `Class starting in ${diffMinutes} minutes: ${nextClass.subject_code}`,
        class: nextClass
      });
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;

  return (
    <div style={{
      background: currentClass ? 
        'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '16px',
      color: 'white',
      marginBottom: '20px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Clock size={20} />
        <span style={{ fontWeight: '600', fontSize: '16px' }}>Live Schedule</span>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            marginLeft: '8px'
          }}
        />
        {!isWeekend && dayOrder !== null && (
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            marginLeft: '8px'
          }}>
            {dayNames[dayOrder]}
          </div>
        )}
        <div style={{ marginLeft: 'auto', fontSize: '14px', opacity: 0.9 }}>
          {formatTime(currentTime)}
        </div>
      </div>

      {isWeekend ? (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '14px', opacity: 0.8 }}>Weekend - No classes scheduled</span>
        </div>
      ) : (
        <>
          {currentClass ? (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Bell size={16} />
                <span style={{ fontWeight: '600' }}>Current Class - Period {currentClass.period_number}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <BookOpen size={14} />
                  <span style={{ fontWeight: '500' }}>{currentClass.subject_code}</span>
                </div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>
                  {currentClass.period.start} - {currentClass.period.end}
                </div>
                {currentClass.room_number && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} />
                    <span style={{ fontSize: '13px' }}>{currentClass.room_number}</span>
                  </div>
                )}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                {currentClass.department} {currentClass.year} - Sem {currentClass.semester} Sec {currentClass.section}
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '14px', opacity: 0.8 }}>No current class</span>
            </div>
          )}

          {nextClass && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                    Next: {nextClass.subject_code} - Period {nextClass.period_number}
                  </div>
                  <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '2px' }}>
                    {nextClass.period.start} - {nextClass.period.end}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>
                    {nextClass.department} {nextClass.year}-{nextClass.semester} Sec {nextClass.section}
                    {nextClass.room_number && ` • Room ${nextClass.room_number}`}
                  </div>
                </div>
                {getTimeUntilNext() && (
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginLeft: '8px'
                  }}>
                    in {getTimeUntilNext()}
                  </div>
                )}
              </div>
            </div>
          )}

          {todaySchedule.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '8px'
            }}>
              <div style={{ fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>Today's Periods:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {todaySchedule.map((classItem, index) => (
                  <div key={index} style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '500',
                    textAlign: 'center'
                  }}>
                    <div>P{classItem.period_number}: {classItem.subject_code}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{classItem.subject_name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {todaySchedule.length === 0 && dayOrder !== null && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '14px', opacity: 0.8 }}>No classes scheduled for {dayNames[dayOrder]}</span>
            </div>
          )}
        </>
      )}
      {/* Bell Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#fbbf24',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Bell size={20} />
          <span style={{ fontWeight: '500' }}>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default RealTimeScheduleNotification;