import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, BarChart3, Users, GraduationCap, Award, Briefcase, TrendingUp, Calendar, Filter, RefreshCw } from 'lucide-react';
import './styles/ReportsManagement.css';

function ReportsManagement({ setCurrentView, setMessage }) {
  const [activeReport, setActiveReport] = useState('overview');
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    academicYear: '2023-24',
    department: 'all',
    program: 'all',
    semester: 'all'
  });

  const reportCategories = [
    { id: 'overview', name: 'Dashboard Overview', icon: BarChart3, color: '#3b82f6' },
    { id: 'student-profile', name: 'Student Profile', icon: Users, color: '#10b981' },
    { id: 'academic', name: 'Academic Performance', icon: GraduationCap, color: '#f59e0b' },
    { id: 'achievements', name: 'Student Achievements', icon: Award, color: '#8b5cf6' },
    { id: 'extracurricular', name: 'Extracurricular Activities', icon: Calendar, color: '#ef4444' },
    { id: 'placements', name: 'Placements & Higher Studies', icon: Briefcase, color: '#06b6d4' },
    { id: 'analytics', name: 'Trends & Analytics', icon: TrendingUp, color: '#84cc16' }
  ];

  useEffect(() => {
    fetchReportData();
  }, [activeReport, filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${activeReport}?${new URLSearchParams(filters)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      setMessage('Failed to load report data');
    }
    setLoading(false);
  };

  const exportReport = async (format) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/export/${activeReport}/${format}?${new URLSearchParams(filters)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeReport}-report-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        setMessage(`✅ Report exported successfully as ${format.toUpperCase()}`);
      }
    } catch (error) {
      setMessage('Failed to export report');
    }
  };

  return (
    <div className="reports-management">
      <div className="reports-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => setCurrentView('main')}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="header-title">
            <h2>Institutional Reports</h2>
            <p>NAAC, NIRF & AICTE Compliant Reports</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchReportData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <div className="export-group">
            <button className="export-btn pdf" onClick={() => exportReport('pdf')}>
              <Download size={16} />
              Export PDF
            </button>
            <button className="export-btn excel" onClick={() => exportReport('xlsx')}>
              <Download size={16} />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      <div className="reports-filters">
        <div className="filter-group">
          <label>Academic Year</label>
          <select value={filters.academicYear} onChange={(e) => setFilters({...filters, academicYear: e.target.value})}>
            <option value="2023-24">2023-24</option>
            <option value="2022-23">2022-23</option>
            <option value="2021-22">2021-22</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Department</label>
          <select value={filters.department} onChange={(e) => setFilters({...filters, department: e.target.value})}>
            <option value="all">All Departments</option>
            <option value="CSE">Computer Science</option>
            <option value="ECE">Electronics & Communication</option>
            <option value="ME">Mechanical Engineering</option>
            <option value="CE">Civil Engineering</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Program</label>
          <select value={filters.program} onChange={(e) => setFilters({...filters, program: e.target.value})}>
            <option value="all">All Programs</option>
            <option value="B.Tech">B.Tech</option>
            <option value="M.Tech">M.Tech</option>
            <option value="MBA">MBA</option>
          </select>
        </div>
      </div>

      <div className="reports-content">
        <div className="reports-sidebar">
          {reportCategories.map(category => (
            <button
              key={category.id}
              className={`report-category ${activeReport === category.id ? 'active' : ''}`}
              onClick={() => setActiveReport(category.id)}
              style={{ '--category-color': category.color }}
            >
              <category.icon size={20} />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        <div className="reports-main">
          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Loading report data...</p>
            </div>
          ) : (
            <ReportContent activeReport={activeReport} data={reportData} />
          )}
        </div>
      </div>
    </div>
  );
}

function ReportContent({ activeReport, data }) {
  switch (activeReport) {
    case 'overview':
      return <OverviewReport data={data} />;
    case 'student-profile':
      return <StudentProfileReport data={data} />;
    case 'academic':
      return <AcademicReport data={data} />;
    case 'achievements':
      return <AchievementsReport data={data} />;
    case 'extracurricular':
      return <ExtracurricularReport data={data} />;
    case 'placements':
      return <PlacementsReport data={data} />;
    case 'analytics':
      return <AnalyticsReport data={data} />;
    default:
      return <OverviewReport data={data} />;
  }
}

function OverviewReport({ data }) {
  const sampleData = {
    totalStudents: 1250,
    totalFaculty: 85,
    departments: 4,
    programs: 8,
    placementRate: 87,
    averagePackage: 6.5,
    researchPublications: 45,
    patents: 3
  };

  return (
    <div className="report-section">
      <h3>Institutional Overview - Academic Year 2023-24</h3>
      
      <div className="overview-grid">
        <div className="overview-card students">
          <div className="card-icon">
            <Users size={24} />
          </div>
          <div className="card-content">
            <h4>{sampleData.totalStudents}</h4>
            <p>Total Students</p>
          </div>
        </div>
        
        <div className="overview-card faculty">
          <div className="card-icon">
            <GraduationCap size={24} />
          </div>
          <div className="card-content">
            <h4>{sampleData.totalFaculty}</h4>
            <p>Faculty Members</p>
          </div>
        </div>
        
        <div className="overview-card placement">
          <div className="card-icon">
            <Briefcase size={24} />
          </div>
          <div className="card-content">
            <h4>{sampleData.placementRate}%</h4>
            <p>Placement Rate</p>
          </div>
        </div>
        
        <div className="overview-card research">
          <div className="card-icon">
            <Award size={24} />
          </div>
          <div className="card-content">
            <h4>{sampleData.researchPublications}</h4>
            <p>Research Publications</p>
          </div>
        </div>
      </div>

      <div className="summary-table">
        <h4>Key Performance Indicators</h4>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current Year</th>
              <th>Previous Year</th>
              <th>Growth</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Student Enrollment</td>
              <td>1,250</td>
              <td>1,180</td>
              <td className="positive">+5.9%</td>
            </tr>
            <tr>
              <td>Faculty Strength</td>
              <td>85</td>
              <td>82</td>
              <td className="positive">+3.7%</td>
            </tr>
            <tr>
              <td>Placement Rate</td>
              <td>87%</td>
              <td>84%</td>
              <td className="positive">+3%</td>
            </tr>
            <tr>
              <td>Average Package (LPA)</td>
              <td>₹6.5</td>
              <td>₹6.0</td>
              <td className="positive">+8.3%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentProfileReport({ data }) {
  return (
    <div className="report-section">
      <h3>Student Profile Analysis</h3>
      
      <div className="profile-stats">
        <div className="stat-card">
          <h4>Total Enrollment: 1,250</h4>
          <div className="stat-breakdown">
            <div className="breakdown-item">
              <span>B.Tech: 950 (76%)</span>
            </div>
            <div className="breakdown-item">
              <span>M.Tech: 200 (16%)</span>
            </div>
            <div className="breakdown-item">
              <span>MBA: 100 (8%)</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h4>Gender Distribution</h4>
          <div className="gender-chart">
            <div className="gender-bar male" style={{width: '65%'}}>
              <span>Male: 812 (65%)</span>
            </div>
            <div className="gender-bar female" style={{width: '35%'}}>
              <span>Female: 438 (35%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="department-table">
        <h4>Department-wise Distribution</h4>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Total Students</th>
              <th>Male</th>
              <th>Female</th>
              <th>Student-Teacher Ratio</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Computer Science & Engineering</td>
              <td>450</td>
              <td>280</td>
              <td>170</td>
              <td>18:1</td>
            </tr>
            <tr>
              <td>Electronics & Communication</td>
              <td>320</td>
              <td>200</td>
              <td>120</td>
              <td>16:1</td>
            </tr>
            <tr>
              <td>Mechanical Engineering</td>
              <td>280</td>
              <td>240</td>
              <td>40</td>
              <td>20:1</td>
            </tr>
            <tr>
              <td>Civil Engineering</td>
              <td>200</td>
              <td>150</td>
              <td>50</td>
              <td>17:1</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AcademicReport({ data }) {
  return (
    <div className="report-section">
      <h3>Academic Performance & Program Outcomes</h3>
      
      <div className="academic-metrics">
        <div className="metric-card">
          <h4>Overall Performance</h4>
          <div className="performance-stats">
            <div className="stat-item">
              <span className="label">Average CGPA:</span>
              <span className="value">7.8</span>
            </div>
            <div className="stat-item">
              <span className="label">Pass Percentage:</span>
              <span className="value">92%</span>
            </div>
            <div className="stat-item">
              <span className="label">Attendance Compliance:</span>
              <span className="value">85%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="cgpa-distribution">
        <h4>CGPA Distribution</h4>
        <table>
          <thead>
            <tr>
              <th>CGPA Range</th>
              <th>Number of Students</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>9.0 - 10.0</td>
              <td>125</td>
              <td>10%</td>
            </tr>
            <tr>
              <td>8.0 - 8.9</td>
              <td>375</td>
              <td>30%</td>
            </tr>
            <tr>
              <td>7.0 - 7.9</td>
              <td>500</td>
              <td>40%</td>
            </tr>
            <tr>
              <td>6.0 - 6.9</td>
              <td>200</td>
              <td>16%</td>
            </tr>
            <tr>
              <td>Below 6.0</td>
              <td>50</td>
              <td>4%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="program-outcomes">
        <h4>Program Outcomes Attainment (CSE Department)</h4>
        <table>
          <thead>
            <tr>
              <th>Program Outcome</th>
              <th>Attainment Level</th>
              <th>Target</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PO1: Engineering Knowledge</td>
              <td>80%</td>
              <td>75%</td>
              <td className="achieved">✅ Achieved</td>
            </tr>
            <tr>
              <td>PO2: Problem Analysis</td>
              <td>75%</td>
              <td>75%</td>
              <td className="achieved">✅ Achieved</td>
            </tr>
            <tr>
              <td>PO3: Design/Development</td>
              <td>72%</td>
              <td>75%</td>
              <td className="pending">⚠️ Below Target</td>
            </tr>
            <tr>
              <td>PO4: Investigation</td>
              <td>78%</td>
              <td>75%</td>
              <td className="achieved">✅ Achieved</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AchievementsReport({ data }) {
  return (
    <div className="report-section">
      <h3>Student Achievements & Certifications</h3>
      
      <div className="achievements-summary">
        <div className="achievement-card">
          <h4>Research Publications</h4>
          <div className="achievement-stats">
            <div className="stat">45 Papers Published</div>
            <div className="stat">12 International Conferences</div>
            <div className="stat">3 Patents Filed</div>
          </div>
        </div>
      </div>

      <div className="certifications-table">
        <h4>MOOCs & Online Certifications</h4>
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Course Title</th>
              <th>Students Completed</th>
              <th>Completion Rate</th>
              <th>Faculty Validated</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>NPTEL</td>
              <td>Data Science with Python</td>
              <td>120</td>
              <td>85%</td>
              <td>✅ Yes</td>
            </tr>
            <tr>
              <td>Coursera</td>
              <td>Cloud Fundamentals (AWS)</td>
              <td>80</td>
              <td>78%</td>
              <td>✅ Yes</td>
            </tr>
            <tr>
              <td>edX</td>
              <td>AI for Everyone</td>
              <td>60</td>
              <td>82%</td>
              <td>✅ Yes</td>
            </tr>
            <tr>
              <td>Udemy</td>
              <td>Full Stack Development</td>
              <td>95</td>
              <td>88%</td>
              <td>✅ Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="technical-activities">
        <h4>Technical Activities & Competitions</h4>
        <div className="activities-grid">
          <div className="activity-item">
            <h5>Hackathons</h5>
            <p>10 teams participated in Smart India Hackathon</p>
            <p>2 teams won national prizes</p>
          </div>
          <div className="activity-item">
            <h5>Paper Presentations</h5>
            <p>30 students presented at National Conferences</p>
            <p>15 papers accepted for publication</p>
          </div>
          <div className="activity-item">
            <h5>Workshops Attended</h5>
            <p>25 technical workshops</p>
            <p>450+ student participants</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExtracurricularReport({ data }) {
  return (
    <div className="report-section">
      <h3>Extracurricular Activities & Social Engagement</h3>
      
      <div className="extracurricular-stats">
        <div className="activity-section">
          <h4>Sports & Cultural Activities</h4>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-name">Inter-college Sports Meet</span>
              <span className="participation">150 students</span>
            </div>
            <div className="activity-item">
              <span className="activity-name">Annual Cultural Festival</span>
              <span className="participation">300 students</span>
            </div>
            <div className="activity-item">
              <span className="activity-name">Technical Symposium</span>
              <span className="participation">200 students</span>
            </div>
          </div>
        </div>

        <div className="activity-section">
          <h4>Leadership & Social Service</h4>
          <div className="leadership-stats">
            <div className="stat-item">
              <span className="label">Student Council Members:</span>
              <span className="value">25</span>
            </div>
            <div className="stat-item">
              <span className="label">Club Presidents:</span>
              <span className="value">12</span>
            </div>
            <div className="stat-item">
              <span className="label">NSS Volunteers:</span>
              <span className="value">200</span>
            </div>
            <div className="stat-item">
              <span className="label">NCC Cadets:</span>
              <span className="value">50</span>
            </div>
          </div>
        </div>
      </div>

      <div className="social-activities">
        <h4>Community Service Activities</h4>
        <table>
          <thead>
            <tr>
              <th>Activity</th>
              <th>Participants</th>
              <th>Duration</th>
              <th>Impact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Blood Donation Camp</td>
              <td>200 students</td>
              <td>1 day</td>
              <td>150 units collected</td>
            </tr>
            <tr>
              <td>Cleanliness Drive</td>
              <td>180 students</td>
              <td>2 days</td>
              <td>5 villages covered</td>
            </tr>
            <tr>
              <td>Digital Literacy Program</td>
              <td>50 students</td>
              <td>1 month</td>
              <td>200 villagers trained</td>
            </tr>
            <tr>
              <td>Tree Plantation</td>
              <td>120 students</td>
              <td>1 day</td>
              <td>500 saplings planted</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="gender-programs">
        <h4>Gender Equity & Inclusion Programs</h4>
        <div className="program-item">
          <h5>"Women in Tech" Workshop</h5>
          <p>100 female participants • Industry expert speakers • Career guidance sessions</p>
        </div>
        <div className="program-item">
          <h5>Anti-Harassment Committee</h5>
          <p>Active committee • 24/7 support system • Regular awareness sessions</p>
        </div>
      </div>
    </div>
  );
}

function PlacementsReport({ data }) {
  return (
    <div className="report-section">
      <h3>Placements & Higher Studies</h3>
      
      <div className="placement-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <h4>Placement Statistics</h4>
            <div className="placement-stats">
              <div className="stat-large">87%</div>
              <div className="stat-label">Placement Rate</div>
            </div>
          </div>
          <div className="summary-card">
            <h4>Package Details</h4>
            <div className="package-stats">
              <div className="package-item">
                <span>Highest: ₹24 LPA</span>
              </div>
              <div className="package-item">
                <span>Average: ₹6.5 LPA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="placement-table">
        <h4>Year-wise Placement Summary</h4>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Eligible Students</th>
              <th>Students Placed</th>
              <th>Higher Studies</th>
              <th>Highest Package</th>
              <th>Average Package</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2023</td>
              <td>400</td>
              <td>350 (87%)</td>
              <td>50 (13%)</td>
              <td>₹24 LPA</td>
              <td>₹6.5 LPA</td>
            </tr>
            <tr>
              <td>2022</td>
              <td>380</td>
              <td>310 (82%)</td>
              <td>45 (12%)</td>
              <td>₹20 LPA</td>
              <td>₹6.0 LPA</td>
            </tr>
            <tr>
              <td>2021</td>
              <td>360</td>
              <td>290 (81%)</td>
              <td>40 (11%)</td>
              <td>₹18 LPA</td>
              <td>₹5.8 LPA</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="top-recruiters">
        <h4>Top Recruiters</h4>
        <div className="recruiters-grid">
          <div className="recruiter-item">TCS - 45 students</div>
          <div className="recruiter-item">Infosys - 40 students</div>
          <div className="recruiter-item">Wipro - 35 students</div>
          <div className="recruiter-item">Amazon - 25 students</div>
          <div className="recruiter-item">HCL - 30 students</div>
          <div className="recruiter-item">Accenture - 28 students</div>
        </div>
      </div>

      <div className="internships-section">
        <h4>Internships & Industry Connect</h4>
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Students</th>
              <th>Duration</th>
              <th>Domain</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Infosys</td>
              <td>50</td>
              <td>8 weeks</td>
              <td>Java Development</td>
            </tr>
            <tr>
              <td>DRDO</td>
              <td>5</td>
              <td>12 weeks</td>
              <td>Defense Research</td>
            </tr>
            <tr>
              <td>BHEL</td>
              <td>15</td>
              <td>6 weeks</td>
              <td>Power Systems</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="entrepreneurship">
        <h4>Entrepreneurship & Startups</h4>
        <div className="startup-stats">
          <div className="stat-item">
            <span className="stat-number">12</span>
            <span className="stat-label">Student Startups</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">₹2.5 Cr</span>
            <span className="stat-label">Total Funding Raised</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">45</span>
            <span className="stat-label">Jobs Created</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsReport({ data }) {
  return (
    <div className="report-section">
      <h3>Trends & Analytics</h3>
      
      <div className="analytics-grid">
        <div className="trend-card">
          <h4>Department-wise Performance Trends</h4>
          <div className="trend-data">
            <div className="trend-item">
              <span className="dept">CSE</span>
              <span className="trend positive">↗ +5.2%</span>
            </div>
            <div className="trend-item">
              <span className="dept">ECE</span>
              <span className="trend positive">↗ +3.8%</span>
            </div>
            <div className="trend-item">
              <span className="dept">ME</span>
              <span className="trend neutral">→ +1.2%</span>
            </div>
            <div className="trend-item">
              <span className="dept">CE</span>
              <span className="trend positive">↗ +4.1%</span>
            </div>
          </div>
        </div>

        <div className="trend-card">
          <h4>Gender-wise Analytics</h4>
          <div className="gender-analytics">
            <div className="gender-metric">
              <span className="label">Female Enrollment Growth:</span>
              <span className="value positive">+8.5%</span>
            </div>
            <div className="gender-metric">
              <span className="label">Female Placement Rate:</span>
              <span className="value">89%</span>
            </div>
            <div className="gender-metric">
              <span className="label">Leadership Positions:</span>
              <span className="value">42% Female</span>
            </div>
          </div>
        </div>
      </div>

      <div className="yearly-comparison">
        <h4>5-Year Performance Comparison</h4>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>2019</th>
              <th>2020</th>
              <th>2021</th>
              <th>2022</th>
              <th>2023</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Enrollment</td>
              <td>1,050</td>
              <td>1,120</td>
              <td>1,180</td>
              <td>1,220</td>
              <td>1,250</td>
              <td className="positive">↗ Growing</td>
            </tr>
            <tr>
              <td>Placement Rate (%)</td>
              <td>78</td>
              <td>75</td>
              <td>81</td>
              <td>84</td>
              <td>87</td>
              <td className="positive">↗ Improving</td>
            </tr>
            <tr>
              <td>Average Package (LPA)</td>
              <td>4.8</td>
              <td>5.2</td>
              <td>5.8</td>
              <td>6.0</td>
              <td>6.5</td>
              <td className="positive">↗ Increasing</td>
            </tr>
            <tr>
              <td>Research Publications</td>
              <td>25</td>
              <td>30</td>
              <td>35</td>
              <td>40</td>
              <td>45</td>
              <td className="positive">↗ Growing</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="predictive-analytics">
        <h4>Predictive Insights</h4>
        <div className="insights-grid">
          <div className="insight-card">
            <h5>Enrollment Projection</h5>
            <p>Expected to reach 1,350 students by 2025</p>
          </div>
          <div className="insight-card">
            <h5>Placement Forecast</h5>
            <p>90%+ placement rate achievable with current trends</p>
          </div>
          <div className="insight-card">
            <h5>Research Growth</h5>
            <p>60+ publications expected by 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsManagement;