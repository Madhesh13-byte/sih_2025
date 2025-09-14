import React from 'react';
import { Bell } from 'lucide-react';

function NotificationsSection({ notifications }) {
  return (
    <div className="notifications-section">
      <h2>Notifications</h2>
      
      <div className="notifications-list">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification-item ${notification.type}`}>
            <div className="notification-content">
              <p>{notification.message}</p>
              <span className="notification-time">{notification.time}</span>
            </div>
          </div>
        ))}
        
        {notifications.length === 0 && (
          <div className="empty-state">
            <Bell size={48} />
            <h3>No Notifications</h3>
            <p>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsSection;