import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, User, BookOpen, Calendar, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import './TimetableSection.css';

function TimetableSection({ user }) {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState('current');
  const timetableRef = useRef();

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/student/class-timetable', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTimetable(data);
      }
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    } finally {
      setLoading(false);
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

  const handlePrint = useReactToPrint({
    content: () => timetableRef.current,
    documentTitle: `Timetable_${user?.name || 'Student'}_${new Date().getFullYear()}`,
  });

  const handleDownloadPDF = () => {
    const element = timetableRef.current;
    const opt = {
      margin: 1,
      filename: `Timetable_${user?.name || 'Student'}_${new Date().getFullYear()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleServerPDF = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/student/timetable/pdf', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Timetable_${user?.name || 'Student'}_${new Date().getFullYear()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="timetable-section">
        <div className="loading-spinner">
          <Clock size={48} />
          <p>Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timetable-section">
      <div className="section-header">
        <h2>Class Timetable</h2>
        <div className="timetable-controls">
          <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
            <option value="current">Current Week</option>
            <option value="next">Next Week</option>
          </select>
          <div className="pdf-options">
            <button onClick={handleDownloadPDF} className="download-btn">
              <Download size={16} />
              Quick PDF
            </button>
            <button onClick={handleServerPDF} className="download-btn server-pdf">
              <Download size={16} />
              High Quality PDF
            </button>
          </div>
          <button onClick={handlePrint} className="print-btn">
            Print
          </button>
        </div>
      </div>

      <div className="timetable-info">
        <div className="info-card">
          <Calendar size={20} />
          <div>
            <h4>Your Class Schedule</h4>
            <p>Department: {user?.department} | Semester: {user?.current_semester || 1}</p>
          </div>
        </div>
      </div>

      <div ref={timetableRef} className="timetable-printable">
        <div className="print-header" style={{ display: 'none' }}>
          <h1>Class Timetable</h1>
          <div className="student-info">
            <p><strong>Student:</strong> {user?.name}</p>
            <p><strong>Department:</strong> {user?.department}</p>
            <p><strong>Semester:</strong> {user?.current_semester || 1}</p>
            <p><strong>Academic Year:</strong> {new Date().getFullYear()}</p>
          </div>
        </div>
        
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
                    <div className="entry-teacher">
                      <User size={14} />
                      {entry.teacher_name}
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
            <h3>No Timetable Available</h3>
            <p>Your class timetable hasn't been created yet. Contact your class coordinator.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default TimetableSection;