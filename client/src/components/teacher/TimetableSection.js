import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Users, BookOpen } from 'lucide-react';

function TimetableSection({ user, currentSemester }) {
  const [timetable, setTimetable] = useState([]);
  const [workload, setWorkload] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState('current');

  useEffect(() => {
    fetchTimetable();
    fetchWorkload();
  }, [currentSemester]);

  const fetchTimetable = async () => {
    try {
      const url = currentSemester ? 
        `http://localhost:5000/api/teacher/timetable?semester=${currentSemester}` :
        'http://localhost:5000/api/teacher/timetable';
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTimetable(data);
      }
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    }
  };

  const fetchWorkload = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/timetable/workload/${user.staff_id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkload(data);
      }
    } catch (error) {
      console.error('Failed to fetch workload:', error);
    }
  };

  const getDayName = (day) => {
    const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const groupByDay = () => {
    const grouped = {};
    timetable.forEach(entry => {
      const day = getDayName(entry.day_of_week);
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(entry);
    });
    
    // Sort by slot order
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.slot_order - b.slot_order);
    });
    
    return grouped;
  };

  const groupedTimetable = groupByDay();

  return (
    <div className="timetable-section">
      <div className="section-header">
        <h2>My Timetable</h2>
        <div className="timetable-controls">
          <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
            <option value="current">Current Week</option>
            <option value="next">Next Week</option>
          </select>
        </div>
      </div>

      {workload && (
        <div className="workload-summary">
          <div className="workload-card">
            <div className="workload-stat">
              <Clock size={20} />
              <div>
                <h3>{workload.total_periods}</h3>
                <p>Total Periods/Week</p>
              </div>
            </div>
            <div className="workload-stat">
              <BookOpen size={20} />
              <div>
                <h3>{workload.subjects_count}</h3>
                <p>Subjects Teaching</p>
              </div>
            </div>
            <div className="workload-stat">
              <Users size={20} />
              <div>
                <h3>{workload.batches_count}</h3>
                <p>Different Batches</p>
              </div>
            </div>
          </div>
          
          <div className="subjects-list">
            <h4>Subjects: </h4>
            <div className="subject-tags">
              {workload.subjects?.map((subject, index) => (
                <span key={index} className="subject-tag">{subject}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="timetable-grid">
        {Object.keys(groupedTimetable).length > 0 ? (
          Object.entries(groupedTimetable).map(([day, entries]) => (
            <div key={day} className="day-column">
              <h3 className="day-header">{day}</h3>
              <div className="day-entries">
                {entries.map(entry => (
                  <div key={entry.id} className="timetable-entry">
                    <div className="entry-time">
                      <Clock size={14} />
                      {entry.start_time} - {entry.end_time}
                    </div>
                    <div className="entry-subject">
                      <strong>{entry.subject_code}</strong>
                      <span>{entry.subject_name}</span>
                    </div>
                    <div className="entry-batch">
                      <Users size={14} />
                      {entry.class_name}
                    </div>
                    {entry.room_number && (
                      <div className="entry-room">
                        <MapPin size={14} />
                        Room {entry.room_number}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-timetable">
            <Clock size={48} />
            <h3>No Timetable Assigned</h3>
            <p>Contact admin to get your timetable assigned</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimetableSection;