import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import './styles/Calendar.css';

const Calendar = ({ setCurrentView }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workingDays, setWorkingDays] = useState({});
  const [selectedType, setSelectedType] = useState('working');
  const [showBulkSelect, setShowBulkSelect] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      const response = await fetch(`/api/calendar/working-days?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const loadedDays = {};
        
        data.forEach(day => {
          const dateKey = day.date.split('T')[0];
          loadedDays[dateKey] = {
            type: day.type,
            description: day.description,
            date: new Date(day.date)
          };
        });
        
        setWorkingDays(loadedDays);
      }
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    }
  };

  const dayTypes = {
    working: { label: 'Working Day', color: '#166534' },
    holiday: { label: 'Holiday', color: '#991b1b' },
    exam: { label: 'Exam Day', color: '#92400e' },
    break: { label: 'Semester Break', color: '#6b21a8' }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = date.toISOString().split('T')[0];
    
    setWorkingDays(prev => ({
      ...prev,
      [dateKey]: { type: selectedType, date, description: '' }
    }));
    
    fetch('/api/calendar/working-days', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        date: dateKey,
        type: selectedType,
        description: '',
        academicYear: new Date().getFullYear().toString()
      })
    }).catch(error => console.error('Save failed:', error));
  };

  const getDayType = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = date.toISOString().split('T')[0];
    return workingDays[dateKey]?.type || null;
  };

  const isWeekend = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleBulkSelect = (startDay, endDay, type) => {
    const updates = {};
    for (let day = startDay; day <= endDay; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateKey = date.toISOString().split('T')[0];
      updates[dateKey] = { type, date };
    }
    setWorkingDays(prev => ({ ...prev, ...updates }));
  };

  const clearMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const filtered = Object.fromEntries(
      Object.entries(workingDays).filter(([key]) => {
        const date = new Date(key);
        return !(date.getFullYear() === year && date.getMonth() === month);
      })
    );
    setWorkingDays(filtered);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const stats = {
    working: Object.values(workingDays).filter(d => d.type === 'working').length,
    holiday: Object.values(workingDays).filter(d => d.type === 'holiday').length,
    exam: Object.values(workingDays).filter(d => d.type === 'exam').length,
    break: Object.values(workingDays).filter(d => d.type === 'break').length
  };

  return (
    <div className="calendar-management">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>Academic Calendar Management</h2>
        <div className="header-actions">
          <button onClick={() => setShowBulkSelect(!showBulkSelect)} className="bulk-btn">
            Bulk Select
          </button>
          <button onClick={clearMonth} className="clear-btn">
            Clear Month
          </button>
        </div>
      </div>

      <div className="calendar-controls">
        <div className="month-nav">
          <button onClick={() => navigateMonth(-1)}>‹</button>
          <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <button onClick={() => navigateMonth(1)}>›</button>
        </div>

        <div className="day-selector">
          <label>Mark as:</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="working">Working Day</option>
            <option value="holiday">Holiday</option>
            <option value="exam">Exam Day</option>
            <option value="break">Semester Break</option>
          </select>
          <span style={{ marginLeft: '10px', fontWeight: 'bold', color: dayTypes[selectedType].color }}>
            Selected: {dayTypes[selectedType].label}
          </span>
        </div>
      </div>

      <div className="calendar-legend">
        {Object.entries(dayTypes).map(([key, type]) => (
          <div key={key} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: type.color }}></span>
            {type.label}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {dayNames.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {days.map((day, index) => {
            const dayType = day ? getDayType(day) : null;
            const weekend = day ? isWeekend(day) : false;
            return (
              <div
                key={`${day}-${dayType}-${index}`}
                className={`calendar-day ${day ? 'active' : 'empty'} ${dayType || ''} ${weekend ? 'weekend' : ''}`}
                onClick={() => day && handleDateClick(day)}
                title={day && dayType ? `${day} - ${dayTypes[dayType].label}` : day ? `${day} - Click to mark as ${dayTypes[selectedType].label}` : ''}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar-stats">
        <h4>Monthly Summary</h4>
        <div className="stats-grid">
          {Object.entries(dayTypes).map(([key, type]) => (
            <div key={key} className="stat-item">
              <span className="stat-number">{stats[key]}</span>
              <span className="stat-label">{type.label}s</span>
            </div>
          ))}
        </div>
      </div>

      {showBulkSelect && (
        <div className="bulk-select-modal">
          <div className="bulk-select-content">
            <h4>Bulk Date Selection</h4>
            <BulkSelectForm onSubmit={handleBulkSelect} onClose={() => setShowBulkSelect(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

const BulkSelectForm = ({ onSubmit, onClose }) => {
  const [startDay, setStartDay] = useState('');
  const [endDay, setEndDay] = useState('');
  const [type, setType] = useState('working');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startDay && endDay && parseInt(startDay) <= parseInt(endDay)) {
      onSubmit(parseInt(startDay), parseInt(endDay), type);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bulk-form">
      <div className="form-row">
        <input
          type="number"
          placeholder="Start Day"
          value={startDay}
          onChange={(e) => setStartDay(e.target.value)}
          min="1"
          max="31"
          required
        />
        <input
          type="number"
          placeholder="End Day"
          value={endDay}
          onChange={(e) => setEndDay(e.target.value)}
          min="1"
          max="31"
          required
        />
      </div>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="working">Working Day</option>
        <option value="holiday">Holiday</option>
        <option value="exam">Exam Day</option>
        <option value="break">Semester Break</option>
      </select>
      <div className="form-actions">
        <button type="submit">Apply</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default Calendar;