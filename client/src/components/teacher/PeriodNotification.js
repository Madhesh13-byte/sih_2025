import React, { useState, useEffect } from 'react';
import { Clock, Bell } from 'lucide-react';

function PeriodNotification({ user }) {
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [nextPeriod, setNextPeriod] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    updatePeriodStatus();
  }, [currentTime]);

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const updatePeriodStatus = () => {
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    let current = null;
    let next = null;

    for (let i = 0; i < periods.length; i++) {
      const period = periods[i];
      const startMinutes = timeToMinutes(period.start);
      const endMinutes = timeToMinutes(period.end);

      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        current = period;
        next = periods[i + 1] || null;
        break;
      } else if (currentMinutes < startMinutes) {
        next = period;
        break;
      }
    }

    setCurrentPeriod(current);
    setNextPeriod(next);
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTimeUntilNext = () => {
    if (!nextPeriod) return null;
    
    const nextStartMinutes = timeToMinutes(nextPeriod.start);
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
        <span style={{ fontWeight: '600', fontSize: '16px' }}>Period Status</span>
        <div style={{ marginLeft: 'auto', fontSize: '14px', opacity: 0.9 }}>
          {formatTime(currentTime)}
        </div>
      </div>

      {currentPeriod ? (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Bell size={16} />
            <span style={{ fontWeight: '600' }}>Current Period: {currentPeriod.number}</span>
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {currentPeriod.start} - {currentPeriod.end}
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
          <span style={{ fontSize: '14px', opacity: 0.8 }}>No active period</span>
        </div>
      )}

      {nextPeriod && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                Next: Period {nextPeriod.number}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>
                {nextPeriod.start} - {nextPeriod.end}
              </div>
            </div>
            {getTimeUntilNext() && (
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                in {getTimeUntilNext()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PeriodNotification;