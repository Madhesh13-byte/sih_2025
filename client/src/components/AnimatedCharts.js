import React, { useEffect, useState } from 'react';

// Animated Progress Bar
export const AnimatedProgressBar = ({ percentage, label, color = '#6366f1', delay = 0 }) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(percentage);
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  return (
    <div className="animated-progress-container">
      <div className="progress-label">
        <span>{label}</span>
        <span className="progress-percentage">{percentage}%</span>
      </div>
      <div className="progress-bar-bg">
        <div 
          className="progress-bar-fill"
          style={{
            width: `${animatedWidth}%`,
            backgroundColor: color,
            transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </div>
  );
};

// Animated Circular Progress
export const AnimatedCircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#6366f1' }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 200);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </svg>
      <div className="circular-progress-text">
        <span className="percentage">{Math.round(animatedPercentage)}%</span>
      </div>
    </div>
  );
};

// Animated Bar Chart
export const AnimatedBarChart = ({ data, height = 200 }) => {
  const [animatedData, setAnimatedData] = useState(data.map(item => ({ ...item, value: 0 })));

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [data]);

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="animated-bar-chart" style={{ height }}>
      <div className="chart-bars">
        {animatedData.map((item, index) => (
          <div key={index} className="bar-container">
            <div 
              className="bar"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || '#6366f1',
                transition: `height 1.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`
              }}
            />
            <span className="bar-label">{item.label}</span>
            <span className="bar-value">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};