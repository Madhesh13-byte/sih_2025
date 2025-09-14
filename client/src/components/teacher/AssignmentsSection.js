import React from 'react';
import { BookOpen } from 'lucide-react';

function AssignmentsSection({ assignments }) {
  return (
    <div className="assignments-section">
      <h2>My Subject Assignments</h2>
      
      <div className="assignments-table">
        <table>
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>Semester</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment.id}>
                <td>{assignment.subject_code}</td>
                <td>{assignment.subject_name}</td>
                <td>{assignment.department}</td>
                <td>{assignment.year}</td>
                <td>{assignment.semester}</td>
                <td><span className="status active">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {assignments.length === 0 && (
          <div className="empty-state">
            <BookOpen size={48} />
            <h3>No Subject Assignments</h3>
            <p>You haven't been assigned any subjects yet. Contact your admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignmentsSection;