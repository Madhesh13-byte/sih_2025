import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Bell, X } from 'lucide-react';

const TimetableNotification = ({ user }) => {
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [nextPeriod, setNextPeriod] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    fetchTimetable();
    const interval = setInterval(checkCurrentPeriod, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await fetch(`/api/staff-timetable/${user?.staff_id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTimetable(data.timetable || []);
        checkCurrentPeriod(data.timetable);
      }
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
      // Mock data for demo
      const mockTimetable = [
        { day: 'Monday', period: 1, time: '09:00-10:00', subject: 'Mathematics', class: 'CSE-A' },
        { day: 'Monday', period: 2, time: '10:00-11:00', subject: 'Physics', class: 'CSE-B' },
        { day: 'Tuesday', period: 1, time: '09:00-10:00', subject: 'Chemistry', class: 'CSE-A' }
      ];
      setTimetable(mockTimetable);
      checkCurrentPeriod(mockTimetable);
    }
  };

  const checkCurrentPeriod = (schedule = timetable) => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todaySchedule = schedule.filter(item => item.day === currentDay);
    
    let current = null;
    let next = null;

    todaySchedule.forEach(period => {
      const [startTime, endTime] = period.time.split('-');
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const periodStart = startHour * 60 + startMin;
      const periodEnd = endHour * 60 + endMin;

      if (currentTime >= periodStart && currentTime <= periodEnd) {
        current = period;
      } else if (currentTime < periodStart && !next) {
        next = period;
      }
    });

    setCurrentPeriod(current);
    setNextPeriod(next);
    
    // Show notification for current or upcoming period
    if (current || next) {
      setShowNotification(true);
    }
  };

  const getTimeUntilNext = () => {
    if (!nextPeriod) return '';
    
    const now = new Date();
    const [startTime] = nextPeriod.time.split('-');
    const [hour, min] = startTime.split(':').map(Number);
    
    const nextPeriodTime = new Date();
    nextPeriodTime.setHours(hour, min, 0, 0);
    
    const diff = nextPeriodTime - now;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes <= 0) return 'Starting now';
    if (minutes < 60) return `in ${minutes} minutes`;
    return `in ${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  if (!showNotification) return null;

  return (
    <div className="timetable-notification">
      <div className="notification-header">
        <Bell size={16} />
        <span>Schedule Update</span>
        <button onClick={() => setShowNotification(false)}>
          <X size={16} />
        </button>
      </div>
      
      <div className="notification-content">
        {currentPeriod && (
          <div className="current-period">
            <div className="period-status current">
              <Clock size={14} />
              <span>Current Class</span>
            </div>
            <div className="period-details">
              <strong>{currentPeriod.subject}</strong>
              <span>{currentPeriod.class} • {currentPeriod.time}</span>
            </div>
          </div>
        )}
        
        {nextPeriod && (
          <div className="next-period">
            <div className="period-status next">
              <Calendar size={14} />
              <span>Next Class {getTimeUntilNext()}</span>
            </div>
            <div className="period-details">
              <strong>{nextPeriod.subject}</strong>
              <span>{nextPeriod.class} • {nextPeriod.time}</span>
            </div>
          </div>
        )}
        
        {!currentPeriod && !nextPeriod && (
          <div className="no-classes">
            <span>No more classes today</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .timetable-notification {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .notification-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          font-weight: 500;
        }
        .notification-header button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        .notification-header button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .notification-content {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .current-period, .next-period {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 10px;
        }
        .period-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          margin-bottom: 5px;
          opacity: 0.9;
        }
        .period-status.current {
          color: #4ade80;
        }
        .period-status.next {
          color: #fbbf24;
        }
        .period-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .period-details strong {
          font-size: 14px;
        }
        .period-details span {
          font-size: 12px;
          opacity: 0.8;
        }
        .no-classes {
          text-align: center;
          padding: 10px;
          opacity: 0.8;
        }
        @media (max-width: 768px) {
          .timetable-notification {
            margin: 10px;
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default TimetableNotification;