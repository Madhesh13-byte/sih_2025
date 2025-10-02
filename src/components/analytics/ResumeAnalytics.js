import React from 'react';
import { useResume } from '../../context/ResumeContext';

const ResumeAnalytics = () => {
  const { resumeData } = useResume();

  const calculateAnalytics = () => {
    const analytics = {
      completeness: 0,
      sections: 0,
      totalSections: 7,
      wordCount: 0,
      skillsCount: 0,
      experienceYears: 0,
      projectsCount: 0,
      educationCount: 0,
      certificationsCount: 0,
      contactMethods: 0,
      atsScore: 0
    };

    // Section completeness
    if (resumeData.personalInfo?.name) analytics.sections++;
    if (resumeData.summary) analytics.sections++;
    if (resumeData.skills?.length > 0) analytics.sections++;
    if (resumeData.experience?.length > 0) analytics.sections++;
    if (resumeData.education?.length > 0) analytics.sections++;
    if (resumeData.projects?.length > 0) analytics.sections++;
    if (resumeData.certifications?.length > 0) analytics.sections++;

    analytics.completeness = Math.round((analytics.sections / analytics.totalSections) * 100);

    // Detailed counts
    analytics.skillsCount = resumeData.skills?.length || 0;
    analytics.projectsCount = resumeData.projects?.length || 0;
    analytics.educationCount = resumeData.education?.length || 0;
    analytics.certificationsCount = resumeData.certifications?.length || 0;

    // Contact methods
    const contact = resumeData.personalInfo || {};
    if (contact.email) analytics.contactMethods++;
    if (contact.phone) analytics.contactMethods++;
    if (contact.linkedin) analytics.contactMethods++;
    if (contact.github) analytics.contactMethods++;
    if (contact.portfolio) analytics.contactMethods++;

    // Word count
    const textFields = [
      resumeData.summary,
      ...(resumeData.experience?.map(exp => exp.description) || []),
      ...(resumeData.projects?.map(proj => proj.description) || [])
    ].filter(Boolean);

    analytics.wordCount = textFields.reduce((count, text) => {
      return count + (text?.split(' ').length || 0);
    }, 0);

    // Experience years calculation
    if (resumeData.experience?.length > 0) {
      const totalMonths = resumeData.experience.reduce((total, exp) => {
        if (exp.startDate && exp.endDate) {
          const start = new Date(exp.startDate);
          const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
          const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
          return total + Math.max(0, months);
        }
        return total;
      }, 0);
      analytics.experienceYears = Math.round(totalMonths / 12 * 10) / 10;
    }

    // ATS Score (simplified calculation)
    let atsScore = 0;
    if (analytics.completeness > 80) atsScore += 30;
    if (analytics.wordCount >= 200 && analytics.wordCount <= 600) atsScore += 25;
    if (analytics.skillsCount >= 5) atsScore += 20;
    if (analytics.contactMethods >= 3) atsScore += 15;
    if (analytics.experienceYears > 0) atsScore += 10;
    analytics.atsScore = atsScore;

    return analytics;
  };

  const analytics = calculateAnalytics();

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="resume-analytics">
      <h4>📊 Resume Analytics</h4>
      
      <div className="analytics-overview">
        <div className="score-circle" style={{ '--score-color': getScoreColor(analytics.atsScore) }}>
          <span className="score-value">{analytics.atsScore}</span>
          <span className="score-label">ATS Score</span>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="stat-item">
          <span className="stat-value">{analytics.completeness}%</span>
          <span className="stat-label">Complete</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{analytics.sections}/{analytics.totalSections}</span>
          <span className="stat-label">Sections</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{analytics.wordCount}</span>
          <span className="stat-label">Words</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{analytics.skillsCount}</span>
          <span className="stat-label">Skills</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{analytics.experienceYears}y</span>
          <span className="stat-label">Experience</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{analytics.contactMethods}/5</span>
          <span className="stat-label">Contacts</span>
        </div>
      </div>

      <div className="analytics-recommendations">
        <h5>💡 Recommendations</h5>
        <ul>
          {analytics.completeness < 100 && (
            <li>Complete all resume sections for better visibility</li>
          )}
          {analytics.wordCount < 200 && (
            <li>Add more details to reach 200-600 words</li>
          )}
          {analytics.skillsCount < 5 && (
            <li>Add more relevant skills to your profile</li>
          )}
          {analytics.contactMethods < 3 && (
            <li>Include more contact methods (LinkedIn, GitHub, etc.)</li>
          )}
          {analytics.atsScore < 80 && (
            <li>Improve ATS compatibility by following recommendations</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ResumeAnalytics;