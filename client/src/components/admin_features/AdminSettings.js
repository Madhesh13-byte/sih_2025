import React, { useState, useEffect } from 'react';
import { Settings, Bell, ToggleLeft, ToggleRight, ArrowLeft } from 'lucide-react';

function AdminSettings({ setCurrentView }) {
  const [settings, setSettings] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ [key]: value })
      });

      if (response.ok) {
        setSettings(prev => ({ ...prev, [key]: value }));
        setMessage('Settings updated successfully!');
      }
    } catch (error) {
      setMessage('Error updating settings');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:5000/api/admin/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading settings...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setCurrentView('main')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            color: '#6c757d'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>System Settings</h1>
      </div>
      {message && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gap: '30px' }}>
        {/* Settings Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Settings size={24} color="#3498db" />
            <h2 style={{ margin: 0, color: '#2c3e50' }}>System Settings</h2>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 0',
            borderBottom: '1px solid #e1e8ed'
          }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>Auto-Create Classes</h3>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
                Automatically create new classes when students are added and no capacity is available
              </p>
            </div>
            <button
              onClick={() => updateSetting('auto_create_classes', settings.auto_create_classes === 'true' ? 'false' : 'true')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: settings.auto_create_classes === 'true' ? '#27ae60' : '#95a5a6'
              }}
            >
              {settings.auto_create_classes === 'true' ? 
                <ToggleRight size={32} /> : 
                <ToggleLeft size={32} />
              }
            </button>
          </div>

          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Current Status:</h4>
            <p style={{ margin: 0, color: '#6c757d' }}>
              Auto-creation is currently <strong>{settings.auto_create_classes === 'true' ? 'ENABLED' : 'DISABLED'}</strong>
              {settings.auto_create_classes === 'true' ? 
                '. New classes will be created automatically when needed.' :
                '. Students will only be assigned to existing classes with available capacity.'
              }
            </p>
          </div>
        </div>

        {/* Notifications Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Bell size={24} color="#e74c3c" />
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Recent Notifications</h2>
            {notifications.filter(n => n.read_status === 0).length > 0 && (
              <span style={{
                backgroundColor: '#e74c3c',
                color: 'white',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {notifications.filter(n => n.read_status === 0).length}
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              <Bell size={48} color="#e1e8ed" />
              <p style={{ marginTop: '15px' }}>No notifications yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  style={{
                    padding: '15px',
                    backgroundColor: notification.read_status === 0 ? '#fff3cd' : '#f8f9fa',
                    borderRadius: '8px',
                    border: `1px solid ${notification.read_status === 0 ? '#ffeaa7' : '#e1e8ed'}`,
                    cursor: notification.read_status === 0 ? 'pointer' : 'default'
                  }}
                  onClick={() => notification.read_status === 0 && markAsRead(notification.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 5px 0', fontWeight: '500', color: '#2c3e50' }}>
                        {notification.message}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {notification.read_status === 0 && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#e74c3c',
                        borderRadius: '50%',
                        marginLeft: '10px',
                        marginTop: '5px'
                      }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;