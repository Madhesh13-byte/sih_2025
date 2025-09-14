import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

// This is a single-file React component that uses Tailwind CSS
// for styling. It is designed to be a self-contained portfolio
// for an advanced student.

// Tailwind CSS is included via a CDN script tag in the HTML.
// This allows all styles to be handled by Tailwind classes.

const App = () => {
  const isDarkMode = false;

  // Hardcoded data for the portfolio. This could be replaced with state or props.
  const studentDetails = {
    name: "XXXXX",
    title: "Information Technology Student",
    regNo: "12345",
    dept: "IT",
    year: "3",
    email: "email@domain.com",
    phone: "+91 98765 43210",
    linkedin: "linkedin.com/in/link",
    github: "github.com/username",
    photoUrl: "https://placehold.co/200x200/6B7280/FFFFFF?text=Student",
    collegeLogoUrl: "https://placehold.co/120x120/6B7280/FFFFFF?text=College",
    university: "College Name"
  };

  const highlightSummary = [
    { text: "Gold Medal in National Coding Contest", icon: "🏅", category: "Achievement" },
    { text: "Research Paper in IEEE Conference", icon: "📄", category: "Research" },
    { text: "Internship at TCS - Data Analyst", icon: "💼", category: "Experience" },
  ];

  const achievementTimeline = [
    { 
      year: "2023", 
      title: "Workshop on AI",
      description: "Workshop on AI → Certified ✅",
      type: "achievement"
    },
    { 
      year: "2024", 
      title: "NPTEL DBMS Course",
      description: "NPTEL DBMS Course → Completed ✅",
      type: "achievement"
    },
    { 
      year: "2025", 
      title: "National Hackathon Winner",
      description: "National Hackathon Winner 🏆",
      type: "achievement"
    }
  ];

  const badges = [
    { name: "Innovator", points: 320 },
    { name: "Leader", points: null },
    { name: "Mentor", points: null },
  ];

  const currentLevel = {
    level: "ADVANCED",
    totalPoints: 320
  };

  return (
    <div className={`min-h-screen font-sans p-4 sm:p-6 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`max-w-5xl mx-auto ${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-3xl shadow-2xl overflow-hidden border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        {/* === Header Section === */}
        <div className={`relative ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-indigo-900 to-slate-800'} text-white`}>
          
          <div className="p-8 sm:p-12">
            <div className="text-center">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                  {studentDetails.name}
                </h1>
                <p className="text-xl text-indigo-100 font-medium mb-6">{studentDetails.title}</p>
              </div>
                
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-200">📧</span>
                  <span>{studentDetails.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === Academic Information === */}
        <div className="p-8 sm:p-12">
          <h2 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-indigo-50'} border ${isDarkMode ? 'border-slate-600' : 'border-indigo-200'}`}>
              <h3 className={`font-semibold text-sm uppercase tracking-wide mb-2 ${isDarkMode ? 'text-slate-400' : 'text-indigo-700'}`}>Registration</h3>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{studentDetails.regNo}</p>
            </div>
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-indigo-50'} border ${isDarkMode ? 'border-slate-600' : 'border-indigo-200'}`}>
              <h3 className={`font-semibold text-sm uppercase tracking-wide mb-2 ${isDarkMode ? 'text-slate-400' : 'text-indigo-700'}`}>Department</h3>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{studentDetails.dept}</p>
            </div>
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-indigo-50'} border ${isDarkMode ? 'border-slate-600' : 'border-indigo-200'}`}>
              <h3 className={`font-semibold text-sm uppercase tracking-wide mb-2 ${isDarkMode ? 'text-slate-400' : 'text-indigo-700'}`}>Academic Year</h3>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{studentDetails.year}</p>
            </div>
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-indigo-50'} border ${isDarkMode ? 'border-slate-600' : 'border-indigo-200'}`}>
              <h3 className={`font-semibold text-sm uppercase tracking-wide mb-2 ${isDarkMode ? 'text-slate-400' : 'text-indigo-700'}`}>Connect</h3>
              <div className="flex gap-3">
                <a href={`https://${studentDetails.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium">LinkedIn</a>
                <a href={`https://${studentDetails.github}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium">GitHub</a>
              </div>
            </div>
          </div>
        </div>

        {/* === Key Achievements === */}
        <div className={`p-8 sm:p-12 ${isDarkMode ? 'bg-slate-700/30' : 'bg-indigo-50'} border-y ${isDarkMode ? 'border-slate-600' : 'border-indigo-200'}`}>
          <h2 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Key Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlightSummary.map((item, index) => (
              <div key={index} className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-600' : 'border-indigo-200'} shadow-lg hover:shadow-xl transition-shadow`}>
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{item.icon}</div>
                  <div className="flex-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${isDarkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'}`}>
                      {item.category}
                    </span>
                    <p className={`text-lg font-semibold leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === Academic Journey === */}
        <div className="p-8 sm:p-12">
          <h2 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Academic Journey</h2>
          <div className="relative">
            <div className={`absolute left-6 top-0 h-full w-0.5 ${isDarkMode ? 'bg-slate-600' : 'bg-indigo-300'}`}></div>
            {achievementTimeline.map((item, index) => (
              <div key={index} className="flex items-start mb-8 last:mb-0 relative">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm z-10 ${
                  item.type === 'milestone' ? 'bg-indigo-600' : 
                  item.type === 'achievement' ? 'bg-indigo-700' : 'bg-indigo-800'
                } shadow-lg`}>
                  {item.year}
                </div>
                <div className={`ml-6 p-6 rounded-xl flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-600' : 'border-indigo-200'} shadow-md`}>
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.title}</h3>
                  <p className={`leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === Badges & Levels === */}
        <div className={`p-8 sm:p-12 ${isDarkMode ? 'bg-slate-700/30' : 'bg-indigo-50'} border-t ${isDarkMode ? 'border-slate-600' : 'border-indigo-200'}`}>
          <h2 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Badges & Levels</h2>
          <div className="text-center">
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              {badges.map((badge, index) => (
                <div key={index} className={`rounded-full px-6 py-3 text-sm font-semibold ${isDarkMode ? 'bg-slate-600 text-slate-200' : 'bg-indigo-100 text-indigo-800'} shadow-md`}>
                  {badge.name}
                  {badge.points && (
                    <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">{badge.points} Points</span>
                  )}
                </div>
              ))}
            </div>
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-600' : 'border-indigo-200'} shadow-lg inline-block`}>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Current Level: {currentLevel.level}</h3>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Total Points: {currentLevel.totalPoints}</p>
            </div>
          </div>
        </div>

        {/* === Footer Section === */}
        <div className={`text-center p-6 ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-indigo-50 text-slate-600'} border-t ${isDarkMode ? 'border-slate-700' : 'border-indigo-200'}`}>
          <p className="text-sm font-medium">🎓 Digital Portfolio • Verified & Generated via Smart Student Hub</p>
          <p className="text-xs mt-2 opacity-75">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default App;

// The following is the boilerplate to render the React App.
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element to render the React app.');
}


