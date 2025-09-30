import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Bell } from 'lucide-react';

function DayOrderNotification({ user }) {
  const [dayOrder, setDayOrder] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [academicCalendar, setAcademicCalendar] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    fetchAcademicCalendar();
    calculateDayOrder();
    return () => clearInterval(timer);
  }, []);

  const fetchAcademicCalendar = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/academic-calendar', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAcademicCalendar(data);
      }
    } catch (error) {
      console.error('Failed to fetch academic calendar:', error);
    }
  };

  const calculateDayOrder = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      setDayOrder(null);
      return;
    }

    // Simple day order calculation (can be made more sophisticated)
    const academicYearStart = new Date('2024-07-01'); // Typical Indian academic year start
    const msPerDay = 24 * 60 * 60 * 1000;
    
    let workingDays = 0;
    let currentDate = new Date(academicYearStart);
    
    while (currentDate <= today) {
      const day = currentDate.getDay();
      if (day !== 0 && day !== 6) { // Not weekend
        workingDays++;
      }
      currentDate.setTime(currentDate.getTime() + msPerDay);
    }
    
    const dayOrderNumber = ((workingDays - 1) % 5) + 1;
    setDayOrder(dayOrderNumber);
  };

  const getDayOrderName = (order) => {
    const dayNames = ['Day I', 'Day II', 'Day III', 'Day IV', 'Day V'];
    return dayNames[order - 1] || 'Unknown';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div style={{
      background: dayOrder ? 
        'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 
        'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      borderRadius: '12px',
      padding: '16px',
      color: 'white',
      marginBottom: '20px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Calendar size={20} />
        <span style={{ fontWeight: '600', fontSize: '16px' }}>Today's Schedule</span>
        <div style={{ marginLeft: 'auto', fontSize: '14px', opacity: 0.9 }}>
          {currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
              {formatDate(currentTime)}
            </div>
            {dayOrder ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} />
                <span style={{ fontWeight: '600', fontSize: '18px' }}>
                  {getDayOrderName(dayOrder)}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', opacity: 0.8 }}>
                  Weekend - No Day Order
                </span>
              </div>
            )}
          </div>
          
          {dayOrder && (
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '700'
            }}>
              {dayOrder}
            </div>
          )}
        </div>
      </div>

      {dayOrder && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '12px',
          opacity: 0.9
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Academic Calendar</span>
            <span>Working Day Pattern: 5-Day Cycle</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DayOrderNotification;