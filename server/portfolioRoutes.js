const puppeteer = require('puppeteer');

const setupPortfolioRoutes = (app, authenticateToken) => {

// Generate Beginner Portfolio PDF
app.post('/api/generate-beginner-portfolio-pdf', authenticateToken, async (req, res) => {
  const { studentData, certificates } = req.body;
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0.5in; }
    body { font-family: 'Roboto', sans-serif; margin: 0; color: #333; }
    .container { border: 2px solid #065f46; background: #fefdf8; }
    .header { padding: 20px; border-bottom: 2px solid #065f46; text-align: center; }
    h1 { margin: 0; font-size: 24px; color: #065f46; font-weight: bold; }
    .student-info { padding: 20px; border-bottom: 1px solid #d6f5d6; display: flex; justify-content: space-between; }
    .certificates { padding: 20px; border-bottom: 1px solid #d6f5d6; }
    .cert-item { padding: 15px 0; border-bottom: 1px solid #f0fdf4; }
    .cert-item:last-child { border-bottom: none; }
    .progress-section { padding: 20px; border-bottom: 1px solid #d6f5d6; }
    .progress-bar { width: 100%; height: 20px; background: #f0fdf4; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #065f46; }
    .footer { padding: 20px; text-align: center; background: #f0fdf4; }
    h2 { color: #065f46; }
    p strong { color: #065f46; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Student Portfolio</h1>
    </div>
    
    <div class="student-info">
      <div>
        <p><strong>Student Name:</strong> ${studentData.name}</p>
        <p><strong>Department:</strong> ${studentData.department}</p>
      </div>
      <div>
        <p><strong>Reg No:</strong> ${studentData.regNo}</p>
        <p><strong>Year:</strong> ${studentData.year}</p>
      </div>
    </div>
    
    <div class="certificates">
      <h2 style="margin: 0 0 15px 0; font-size: 18px;">Certificates & Achievements</h2>
      ${certificates.map(cert => `
        <div class="cert-item">
          <p style="margin: 0 0 5px 0; font-weight: bold;">- Certificate: "${cert.title}"</p>
          <p style="margin: 0; font-size: 14px; color: #666;">Date: ${cert.date} &nbsp;&nbsp;&nbsp; Status: ${cert.status} <span style="color: #22c55e; font-weight: bold;">✓</span></p>
        </div>
      `).join('')}
    </div>
    
    <div class="progress-section">
      <p style="margin: 0 0 10px 0; font-weight: bold;">Level: ${studentData.level} (${studentData.points} Points)</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(studentData.points / studentData.maxPoints) * 100}%;"></div>
      </div>
      <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${studentData.points}/${studentData.maxPoints} points to next level</p>
    </div>
    
    <div class="footer">
      <p style="margin: 0; font-size: 14px; color: #666;">Auto-generated on Smart Student Hub</p>
    </div>
  </div>
</body>
</html>`;
  
  try {
    const browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${studentData.name.replace(/\\s+/g, '_')}_Beginner_Portfolio.pdf"`);
    res.end(pdf, 'binary');
  } catch (error) {
    console.error('Beginner PDF generation error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

// Generate Intermediate Portfolio PDF
app.post('/api/generate-intermediate-portfolio-pdf', authenticateToken, async (req, res) => {
  console.log('🔄 Intermediate Portfolio PDF generation started');
  const { studentData, achievements, badges } = req.body;
  console.log('📊 Received data:', { studentData: studentData?.name, achievements: achievements ? 'present' : 'missing', badges: badges ? badges.length : 0 });
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0.5in; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; color: #333; background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 50%, #60a5fa 100%); }
    .container { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; padding: 20px; }
    .header-section { background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); border-radius: 12px; padding: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; }
    .logo-photo-container { display: flex; align-items: center; gap: 30px; margin-bottom: 25px; flex-wrap: wrap; }
    .logo-placeholder { width: 100px; height: 100px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 40px; }
    .photo-placeholder { width: 100px; height: 100px; background: linear-gradient(135deg, #f1f5f9, #e2e8f0); border-radius: 12px; border: 2px solid #2563eb; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #64748b; text-align: center; }
    .student-info { flex: 1; }
    .main-title { font-size: 2rem; font-weight: 700; color: white; margin: 0 0 10px 0; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
    .info-item { margin: 5px 0; color: white; font-weight: 500; }
    .info-label { color: #bfdbfe; }
    .achievements-section { background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%); border-radius: 12px; padding: 25px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; }
    .section-title { font-size: 1.5rem; font-weight: 600; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .subsection-title { font-size: 1.1rem; font-weight: 600; color: #475569; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
    .achievement-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px; }
    .achievement-item { padding: 12px 16px; background: linear-gradient(135deg, #1e40af, #1e3a8a); border-radius: 8px; border: 1px solid #3b82f6; display: flex; align-items: center; gap: 10px; }
    .achievement-text { color: white; font-weight: 500; }
    .progress-section { background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 12px; padding: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; }
    .progress-title { font-size: 1.5rem; font-weight: 600; color: #1e293b; margin-bottom: 25px; text-align: center; }
    .progress-container { display: flex; align-items: center; gap: 40px; justify-content: center; flex-wrap: wrap; }
    .progress-circle { position: relative; width: 150px; height: 150px; }
    .progress-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
    .progress-percentage { font-size: 28px; font-weight: 700; color: #2563eb; }
    .progress-label { font-size: 12px; color: #64748b; margin-top: 2px; }
    .level-info { background: linear-gradient(135deg, #bfdbfe, #93c5fd); padding: 25px; border-radius: 12px; border: 2px solid #2563eb; text-align: center; min-width: 200px; }
    .level-title { font-size: 24px; font-weight: 700; color: #1d4ed8; margin-bottom: 8px; }
    .level-points { font-size: 16px; color: #1e293b; font-weight: 600; margin-bottom: 5px; }
    .level-next { font-size: 14px; color: #64748b; }
    .contact-section { background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 12px; padding: 25px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; text-align: center; }
    .contact-title { font-size: 1.2rem; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
    .contact-buttons { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; }
    .contact-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #0891b2; color: white; }
    .btn-outline { background: transparent; color: #1e293b; border: 2px solid #1e293b; }
    .footer { background: #1e293b; color: white; border-radius: 12px; padding: 20px; text-align: center; }
    .footer-content { display: flex; align-items: center; justify-content: center; gap: 10px; }
    .footer-text { margin: 0; font-size: 14px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-section">
      <div class="logo-photo-container">
        <div class="logo-placeholder">🎓</div>
        <div class="photo-placeholder">[Student Photo]</div>
        <div class="student-info">
          <h1 class="main-title">INTERMEDIATE PORTFOLIO</h1>
          <div class="info-grid">
            <div>
              <p class="info-item"><span class="info-label">Name:</span> ${studentData.name}</p>
              <p class="info-item"><span class="info-label">Dept:</span> ${studentData.department}</p>
            </div>
            <div>
              <p class="info-item"><span class="info-label">Reg No:</span> ${studentData.regNo}</p>
              <p class="info-item"><span class="info-label">Year:</span> ${studentData.year}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="achievements-section">
      <h2 class="section-title">🏆 Achievements</h2>
      
      <div>
        <h3 class="subsection-title">📖 Academic Courses</h3>
        <div class="achievement-list">
          ${achievements?.academics?.map(item => `
            <div class="achievement-item">
              <span>✓</span>
              <span class="achievement-text">${item.title}</span>
            </div>
          `).join('') || '<p>No academic achievements</p>'}
        </div>
      </div>
      
      <div>
        <h3 class="subsection-title">👥 Extracurricular Activities</h3>
        <div class="achievement-list">
          ${achievements?.extracurricular?.map(item => `
            <div class="achievement-item">
              <span>🏅</span>
              <span class="achievement-text">${item.title}</span>
            </div>
          `).join('') || '<p>No extracurricular activities</p>'}
        </div>
      </div>
    </div>
    
    <div class="progress-section">
      <h3 class="progress-title">Level Progress</h3>
      <div class="progress-container">
        <div class="progress-circle">
          <svg width="150" height="150" style="transform: rotate(-90deg);">
            <circle cx="75" cy="75" r="65" stroke="#e2e8f0" stroke-width="10" fill="transparent" />
            <circle cx="75" cy="75" r="65" stroke="#2563eb" stroke-width="10" fill="transparent" 
              stroke-dasharray="${2 * Math.PI * 65}" 
              stroke-dashoffset="${2 * Math.PI * 65 * (1 - (studentData.points / studentData.maxPoints))}" 
              stroke-linecap="round" />
          </svg>
          <div class="progress-text">
            <div class="progress-percentage">${Math.round((studentData.points / studentData.maxPoints) * 100)}%</div>
            <div class="progress-label">Complete</div>
          </div>
        </div>
        
        <div class="level-info">
          <div class="level-title">INTERMEDIATE</div>
          <div class="level-points">Current Points: ${studentData.points}</div>
          <div class="level-next">Next Level: ${studentData.maxPoints} pts</div>
        </div>
      </div>
    </div>
    
    <div class="contact-section">
      <h3 class="contact-title">Let's Connect!</h3>
      <div class="contact-buttons">
        <button class="contact-btn btn-primary">📧 Email Me</button>
        <button class="contact-btn btn-secondary">💼 LinkedIn</button>
        <button class="contact-btn btn-outline">📞 Call Me</button>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-content">
        <span>⬇️</span>
        <p class="footer-text">Downloaded via Smart Student Hub</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  
  try {
    const browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });
    
    await browser.close();
    
    console.log('✅ Intermediate PDF generated successfully, size:', pdf.length);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${studentData.name.replace(/\\s+/g, '_')}_Intermediate_Portfolio.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.end(pdf, 'binary');
  } catch (error) {
    console.error('❌ Intermediate PDF generation error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Intermediate PDF generation failed: ' + error.message });
  }
});

// Generate Advanced Portfolio PDF
app.post('/api/generate-advanced-portfolio-pdf', authenticateToken, async (req, res) => {
  const { studentData, certificates } = req.body;
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0.5in; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; color: #333; background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%); }
    .container { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; padding: 20px; }
    .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); border: 1px solid #e2e8f0; padding: 24px; }
    .header-card { border-left: 4px solid #0f172a; }
    .header-section { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
    .logo-photo-container { display: flex; justify-content: center; gap: 30px; margin-bottom: 25px; flex-wrap: wrap; }
    .logo-placeholder { width: 100px; height: 100px; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 40px; }
    .photo-placeholder { width: 100px; height: 100px; border-radius: 12px; border: 2px solid #0f172a; background: linear-gradient(135deg, #f8fafc, #e2e8f0); display: flex; align-items: center; justify-content: center; font-size: 12px; color: #64748b; text-align: center; }
    .main-title { font-size: 2rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .student-details { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); }
    .student-details h2 { font-size: 1.2rem; font-weight: 600; margin-bottom: 15px; color: #0f172a; }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px; }
    .details-grid p, .contact-info p { margin: 8px 0; color: #334155; font-weight: 500; }
    .details-grid span, .contact-info span { color: #64748b; margin-right: 8px; }
    .contact-info { padding-top: 15px; border-top: 1px solid #e2e8f0; }
    .section-title { font-size: 1.3rem; font-weight: 600; margin-bottom: 20px; color: #0f172a; display: flex; align-items: center; gap: 10px; }
    .achievements { display: flex; flex-direction: column; gap: 15px; }
    .achievement-item { display: flex; align-items: center; gap: 15px; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .achievement-item.gold { background: linear-gradient(135deg, #fef3c7, #fde68a); border-color: #f59e0b; }
    .achievement-item.blue { background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-color: #3b82f6; }
    .achievement-item.green { background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-color: #10b981; }
    .achievement-icon { padding: 10px; border-radius: 50%; background: white; border: 2px solid; }
    .achievement-item.gold .achievement-icon { border-color: #f59e0b; color: #f59e0b; }
    .achievement-item.blue .achievement-icon { border-color: #3b82f6; color: #3b82f6; }
    .achievement-item.green .achievement-icon { border-color: #10b981; color: #10b981; }
    .achievement-title { font-weight: 600; display: block; margin-bottom: 4px; color: #0f172a; font-size: 1rem; }
    .achievement-item p { font-size: 0.85rem; color: #64748b; margin: 0; }
    .timeline { display: flex; flex-direction: column; gap: 12px; }
    .timeline-item { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 12px; border: 1px solid #e2e8f0; }
    .timeline-item.latest { background: linear-gradient(135deg, #fef3c7, #fde68a); border-color: #f59e0b; }
    .timeline-content { display: flex; align-items: center; gap: 12px; }
    .badge { background: #0f172a; color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
    .timeline-item.latest .badge { background: #f59e0b; }
    .timeline-item span:not(.badge) { font-weight: 600; color: #0f172a; }
    .timeline-item p { font-size: 0.8rem; color: #64748b; margin: 2px 0 0 0; }
    .check-icon { color: #10b981; }
    .trophy-icon { color: #f59e0b; }
    .badges-section { display: flex; flex-direction: column; gap: 15px; }
    .badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .badge.success { background: #10b981; color: white; }
    .badge.primary { background: #3b82f6; color: white; }
    .badge.accent { background: #0891b2; color: white; }
    .level-info { background: linear-gradient(135deg, #dbeafe, #bfdbfe); padding: 15px; border-radius: 12px; border: 1px solid #3b82f6; }
    .level { color: #0f172a; font-weight: 700; font-size: 1rem; }
    .points { color: #64748b; }
    .contact-card { background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-left: 4px solid #0891b2; }
    .contact-card h2 { text-align: center; color: #0f172a; margin-bottom: 20px; font-size: 1.3rem; }
    .contact-buttons { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
    .btn { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 8px; border: none; font-weight: 600; font-size: 0.85rem; }
    .btn.primary { background: #0f172a; color: white; }
    .btn.accent { background: #0891b2; color: white; }
    .btn.outline { background: transparent; color: #0f172a; border: 2px solid #0f172a; }
    .footer-card { background: #0f172a; color: white; text-align: center; }
    .footer-card p { font-size: 0.85rem; color: #cbd5e1; margin: 0; }
    .footer-card span { font-weight: 600; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card header-card">
      <div class="header-section">
        <div class="logo-photo-container">
          <div class="logo-placeholder">🎓</div>
          <div class="photo-placeholder">[Student Photo]</div>
        </div>
        <h1 class="main-title">ADVANCED PORTFOLIO</h1>
      </div>
      
      <div class="student-details">
        <h2>Student Details:</h2>
        <div class="details-grid">
          <div>
            <p><span>Name:</span> ${studentData.name}</p>
            <p><span>Dept:</span> ${studentData.department}</p>
          </div>
          <div>
            <p><span>Reg No:</span> ${studentData.regNo}</p>
            <p><span>Year:</span> ${studentData.year}</p>
          </div>
        </div>
        <div class="contact-info">
          <p><span>Contact:</span> email@domain.com</p>
          <p><span>LinkedIn:</span> link</p>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h2 class="section-title">🏆 Certifications</h2>
      <div class="achievements">
        <div class="achievement-item gold">
          <div class="achievement-icon">🏆</div>
          <div>
            <span class="achievement-title">Technical Certifications 🏆</span>
            <p>✅ Programming, Cloud Computing, Database Management</p>
          </div>
        </div>
        
        <div class="achievement-item blue">
          <div class="achievement-icon">📄</div>
          <div>
            <span class="achievement-title">Academic Courses & MOOCs 📄</span>
            <p>✅ NPTEL, Coursera, edX Completion Certificates</p>
          </div>
        </div>
        
        <div class="achievement-item green">
          <div class="achievement-icon">💼</div>
          <div>
            <span class="achievement-title">Professional Training 💼</span>
            <p>✅ Internship, Workshop & Seminar Certificates</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h2 class="section-title">🏅 Achievement Timeline</h2>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-content">
            <span class="badge">Year 1</span>
            <div>
              <span>Foundation Courses → Completed</span>
              <p>📜 Programming, Mathematics, Basic IT Skills</p>
            </div>
          </div>
          <span class="check-icon">✓</span>
        </div>
        
        <div class="timeline-item">
          <div class="timeline-content">
            <span class="badge">Year 2</span>
            <div>
              <span>Core Subject Certifications → Earned</span>
              <p>📜 Data Structures, DBMS, Web Development</p>
            </div>
          </div>
          <span class="check-icon">✓</span>
        </div>
        
        <div class="timeline-item latest">
          <div class="timeline-content">
            <span class="badge">Year 3</span>
            <div>
              <span>Advanced Specialization Certificates</span>
              <p>🏆 Current Focus: AI/ML, Cloud Computing, Projects</p>
            </div>
          </div>
          <span class="trophy-icon">🏆</span>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h2>Badges & Levels</h2>
      <div class="badges-section">
        <div>
          <p>Earned:</p>
          <div class="badges">
            <span class="badge success">Innovator</span>
            <span class="badge primary">Leader</span>
            <span class="badge accent">Mentor</span>
          </div>
        </div>
        <div class="level-info">
          <p>Current Level: <span class="level">ADVANCED</span> <span class="points">(${studentData.totalPoints || studentData.points} Points)</span></p>
        </div>
      </div>
    </div>
    
    <div class="card contact-card">
      <h2>Let's Connect!</h2>
      <div class="contact-buttons">
        <button class="btn primary">📧 Contact Me</button>
        <button class="btn accent">💼 LinkedIn Profile</button>
        <button class="btn outline">📞 Call Me</button>
      </div>
    </div>
    
    <div class="card footer-card">
      <p><span>Footer:</span> Verified & Generated via Smart Student Hub</p>
    </div>
  </div>
</body>
</html>`;
  
  try {
    const browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${studentData.name.replace(/\\s+/g, '_')}_Advanced_Portfolio.pdf"`);
    res.end(pdf, 'binary');
  } catch (error) {
    console.error('Advanced PDF generation error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

};

module.exports = setupPortfolioRoutes;