import React, { useState, useEffect } from 'react';
import { Clock, Bell, AlertCircle } from 'lucide-react';

function LivePeriodNotification({ user }) {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      fetchLiveStatus();
    }, 30000); // Update every 30 seconds

    fetchLiveStatus();
    return () => clearInterval(timer);
  }, []);

  const fetchLiveStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/live-period-status?staff_id=${user?.staff_id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentStatus(data.status);
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Failed to fetch live status:', error);
    }
  };

  return (
    <div style={{
      background: currentStatus?.isActive ? 
        'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '16px',
      color: 'white',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Clock size={20} />
        <span style={{ fontWeight: '600' }}>Live Status</span>
        <div style={{ marginLeft: 'auto', fontSize: '14px' }}>
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {currentStatus?.isActive ? (
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={16} />
            <span style={{ fontWeight: '600' }}>Active: {currentStatus.subject}</span>
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>
            {currentStatus.class} • Room {currentStatus.room} • Ends at {currentStatus.endTime}
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
          <span>No active class</span>
          {currentStatus?.next && (
            <div style={{ marginTop: '8px', fontSize: '13px' }}>
              Next: {currentStatus.next.subject} at {currentStatus.next.startTime}
            </div>
          )}
        </div>
      )}

      {announcements.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          {announcements.map(announcement => (
            <div key={announcement.id} style={{
              background: 'rgba(255,193,7,0.2)',
              border: '1px solid rgba(255,193,7,0.5)',
              borderRadius: '6px',
              padding: '8px',
              marginBottom: '6px',
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{announcement.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LivePeriodNotification;