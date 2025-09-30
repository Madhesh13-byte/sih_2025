import React from 'react';
import { BookOpen, Users, Calendar } from 'lucide-react';
import RealTimeScheduleNotification from './RealTimeScheduleNotification';

function OverviewSection({ user, assignments }) {
  return (
    <div className="overview-section">
      <h2>Welcome back, {user?.name}!</h2>
      
      <RealTimeScheduleNotification user={user} />
      
      <div className="overview-stats">
        <div className="stat-card">
          <div className="stat-icon subjects">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <h3>{assignments.length}</h3>
            <p>Subjects Assigned</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon classes">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{new Set(assignments.map(a => `${a.department}-${a.year}`)).size}</h3>
            <p>Classes Teaching</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon semesters">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{new Set(assignments.map(a => a.semester)).size}</h3>
            <p>Active Semesters</p>
          </div>
        </div>
      </div>
      
      <div className="recent-assignments">
        <h3>Your Current Assignments</h3>
        <div className="assignments-grid">
          {assignments.map(assignment => (
            <div key={assignment.id} className="assignment-card">
              <h4>{assignment.subject_name}</h4>
              <p><strong>Code:</strong> {assignment.subject_code}</p>
              <p><strong>Class:</strong> {assignment.department} {assignment.year}</p>
              <p><strong>Semester:</strong> {assignment.semester}</p>
            </div>
          ))}
        </div>
        
        {assignments.length === 0 && (
          <div className="empty-state">
            <BookOpen size={48} />
            <h3>No Assignments Yet</h3>
            <p>Contact admin to get subject assignments</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OverviewSection;
