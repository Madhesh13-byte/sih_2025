import React, { useState, useEffect } from 'react';
import { Save, Users } from 'lucide-react';

function AttendanceSection({ assignments }) {
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [students, setStudents] = useState([]);
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [academicYear, setAcademicYear] = useState('');
  
  const fetchStudents = async (assignmentId) => {
    console.log('Fetching students for assignment:', assignmentId);
    try {
      const response = await fetch(`http://localhost:5000/api/staff/students/${assignmentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Students API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students data received:', data);
        
        if (data.students && data.students.length > 0) {
          setStudents(data.students.map(student => ({
            id: student.id,
            name: student.name,
            regNo: student.register_no,
            section: student.section,
            present: false
          })));
        } else {
          console.log('No students found in response');
          setStudents([]);
        }
      } else {
        console.error('Failed to fetch students, response not ok:', response.status);
        setStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    }
  };
  
  const fetchTimetablePeriods = async (assignmentId) => {
    try {
      const assignment = assignments.find(a => a.id.toString() === assignmentId);
      if (!assignment) return;
      
      const response = await fetch(`http://localhost:5000/api/timetables?department=${assignment.department}&year=${assignment.year}&semester=${assignment.semester}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const timetables = await response.json();
        const subjectPeriods = timetables.filter(t => 
          t.subject_code === assignment.subject_code
        );
        
        console.log('Assignment subject_code:', assignment.subject_code);
        console.log('All timetable subject codes:', timetables.map(t => t.subject_code));
        console.log('Exact match found:', timetables.some(t => t.subject_code === assignment.subject_code));
        console.log('Filtered subject periods:', subjectPeriods);
        
        const dayOrders = ['I', 'II', 'III', 'IV', 'V'];
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
        
        const formattedPeriods = subjectPeriods
          .filter(sp => sp.period_number >= 1 && sp.period_number <= 8 && sp.day_of_week >= 0 && sp.day_of_week <= 4)
          .map(sp => {
            const periodInfo = periods[sp.period_number - 1];
            return {
              id: `${sp.day_of_week}-${sp.period_number}`,
              dayOrder: dayOrders[sp.day_of_week],
              period: sp.period_number,
              time: `${periodInfo.start}-${periodInfo.end}`,
              dayOfWeek: sp.day_of_week,
              periodNumber: sp.period_number
            };
          });
        
        setAvailablePeriods(formattedPeriods);
      }
    } catch (error) {
      console.error('Failed to fetch timetable periods:', error);
    }
  };
  
  const calculateDateForDayOrder = (dayOrder) => {
    // Simple mapping: Day I = Monday, Day II = Tuesday, etc.
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOrderMap = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
    const targetDay = dayOrderMap[dayOrder];
    
    // Calculate days to add/subtract to get to target day
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7; // Next occurrence
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    
    return targetDate.toISOString().split('T')[0];
  };
  
  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId);
    const selectedPeriodData = availablePeriods.find(p => p.id === periodId);
    if (selectedPeriodData) {
      const newDate = calculateDateForDayOrder(selectedPeriodData.dayOrder);
      setSelectedDate(newDate);
    }
  };
  
  useEffect(() => {
    if (selectedAssignment) {
      fetchStudents(selectedAssignment);
      fetchTimetablePeriods(selectedAssignment);
    }
  }, [selectedAssignment]);

  const handleAttendanceChange = (studentId, present) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, present } : student
    ));
  };

  const saveAttendance = async () => {
    if (!selectedAssignment || !selectedPeriod) return;

    const assignment = assignments.find(a => a.id.toString() === selectedAssignment);
    const period = availablePeriods.find(p => p.id === selectedPeriod);
    
    console.log('Saving attendance for:', {
      assignment: assignment?.subject_code,
      students: students.length,
      period: period?.dayOfWeek + '-' + period?.periodNumber
    });

    try {
      const response = await fetch('http://localhost:5000/api/staff/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          students: students.map(s => ({ id: s.id, status: s.present ? 'present' : 'absent' })),
          subject_code: assignment?.subject_code,
          department: assignment?.department,
          year: assignment?.year,
          semester: assignment?.semester,
          day_of_week: period?.dayOfWeek,
          period_number: period?.periodNumber,
          academic_year: new Date().getFullYear().toString()
        })
      });

      if (response.ok) {
        alert('Attendance saved successfully!');
        console.log('Attendance saved for', students.length, 'students');
      } else {
        console.error('Failed to save attendance:', response.status);
        alert('Failed to save attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance');
    }
  };

  const markAllPresent = () => {
    setStudents(students.map(student => ({ ...student, present: true })));
  };

  return (
    <div className="attendance-section">
      <h2>Attendance Management</h2>
      
      <div className="attendance-filters" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
          <option value="">Select Subject Assignment</option>
          {assignments.map(assignment => (
            <option key={assignment.id} value={assignment.id}>
              {assignment.subject_code} - {assignment.department} {assignment.year}
            </option>
          ))}
        </select>
        
        <select value={selectedPeriod} onChange={(e) => handlePeriodChange(e.target.value)}>
          <option value="">Select Period</option>
          {availablePeriods.length > 0 ? (
            availablePeriods.map(period => (
              <option key={period.id} value={period.id}>
                Day {period.dayOrder} - Period {period.period} ({period.time})
              </option>
            ))
          ) : (
            <option disabled>No periods scheduled for this subject</option>
          )}
        </select>
        
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        
        <button className="mark-all-btn" onClick={markAllPresent}>
          <Users size={16} /> Mark All Present
        </button>
      </div>

      {selectedAssignment && selectedPeriod && (
        <div className="attendance-table">
          <h3>Mark Attendance - {assignments.find(a => a.id.toString() === selectedAssignment)?.subject_code} (Day {availablePeriods.find(p => p.id === selectedPeriod)?.dayOrder} P{availablePeriods.find(p => p.id === selectedPeriod)?.period} - {selectedDate})</h3>
          <table>
            <thead>
              <tr>
                <th>Register No</th>
                <th>Student Name</th>
                <th>Present</th>
                <th>Absent</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.regNo}</td>
                  <td>{student.name}</td>
                  <td>
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={student.present === true}
                      onChange={() => handleAttendanceChange(student.id, true)}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={student.present === false}
                      onChange={() => handleAttendanceChange(student.id, false)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="save-btn" onClick={saveAttendance}>
            <Save size={16} /> Save Attendance
          </button>
        </div>
      )}
    </div>
  );
}

export default AttendanceSection;