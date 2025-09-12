// Academic year utilities
const getCurrentAcademicYear = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // Academic year starts in June
  return currentMonth >= 6 ? currentYear : currentYear - 1;
};

const calculateStudentYear = (joiningYear) => {
  if (!joiningYear) return null;
  const currentAcademicYear = getCurrentAcademicYear();
  const yearDiff = currentAcademicYear - joiningYear + 1;
  return Math.min(Math.max(yearDiff, 1), 4);
};

const getYearRoman = (year) => {
  const romanNumerals = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
  return romanNumerals[year] || 'I';
};

const getCurrentSemester = (studentYear) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const isOddSemester = currentMonth >= 6 && currentMonth <= 11;
  const baseSemester = (studentYear - 1) * 2;
  return baseSemester + (isOddSemester ? 1 : 2);
};

module.exports = {
  getCurrentAcademicYear,
  calculateStudentYear,
  getYearRoman,
  getCurrentSemester
};