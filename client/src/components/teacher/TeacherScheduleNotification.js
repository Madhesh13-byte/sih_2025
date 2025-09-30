import React, { useState, useEffect } from 'react';
import { Clock, Bell, BookOpen, MapPin } from 'lucide-react';

function TeacherScheduleNotification({ user }) {
  const [currentClass, setCurrentClass] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todaySchedule, setTodaySchedule] = useState([]);

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

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNames = ['I', 'II', 'III', 'IV', 'V'];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    fetchTodaySchedule();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    updateClassStatus();
  }, [currentTime, todaySchedule]);

  const getDayOrder = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, etc.
    
    if (dayOfWeek === 0 || dayOfWeek === 6) return null; // Weekend
    
    // Calculate day order (1-5) based on working days
    // You can modify this logic based on your institution's day order system
    const startDate = new Date('2024-01-01'); // Academic year start
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const workingDays = Math.floor(diffDays * (5/7)); // Approximate working days
    
    return (workingDays % 5) + 1; // Returns 1-5
  };

  const fetchTodaySchedule = async () => {
    try {
      const today = new Date();
      const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert to 0-4 (Mon-Fri)
      
      if (dayIndex > 4) return; // Weekend

      const response = await fetch(`http://localhost:5000/api/teacher-schedule?staff_id=${user?.staff_id}&day=${dayIndex}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const schedule = await response.json();
        setTodaySchedule(schedule);
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    }
  };

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const updateClassStatus = () => {
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    let current = null;
    let next = null;

    // Find current and next classes from teacher's schedule
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
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '16px',
      color: 'white',
      marginBottom: '20px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Clock size={20} />
        <span style={{ fontWeight: '600', fontSize: '16px' }}>My Schedule - {days[today.getDay()]}</span>
        {getDayOrder() && (
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            marginLeft: '8px'
          }}>
            Day {getDayOrder()}
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
                <span style={{ fontWeight: '600' }}>Current Class</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <BookOpen size={14} />
                  <span style={{ fontWeight: '500' }}>{currentClass.subject_code}</span>
                </div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>
                  Period {currentClass.period_number} ({currentClass.period.start} - {currentClass.period.end})
                </div>
                {currentClass.room_number && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} />
                    <span style={{ fontSize: '13px' }}>{currentClass.room_number}</span>
                  </div>
                )}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                {currentClass.department} {currentClass.year} - Semester {currentClass.semester} Section {currentClass.section}
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
                    Next: {nextClass.subject_code}
                  </div>
                  <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '2px' }}>
                    Period {nextClass.period_number} ({nextClass.period.start} - {nextClass.period.end})
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

          {todaySchedule.length === 0 && !isWeekend && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '14px', opacity: 0.8 }}>No classes scheduled for today</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TeacherScheduleNotification;