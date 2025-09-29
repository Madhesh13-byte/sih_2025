const puppeteer = require('puppeteer');

const generateOfficialPortfolio = async (app, authenticateToken) => {
  app.post('/api/generate-portfolio-pdf', authenticateToken, async (req, res) => {
  console.log('Official PDF generation request received');
  
  if (!puppeteer) {
    return res.status(500).json({ error: 'Puppeteer not available' });
  }
  
  const { studentData, semesterResults, achievements } = req.body;
  
  if (!studentData || !semesterResults || !achievements) {
    return res.status(400).json({ error: 'Missing required data' });
  }
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0.5in; }
    body { font-family: 'Times New Roman', serif; margin: 0; color: #000; }
    .page-break { page-break-before: always; }
    .header { text-align: center; border-bottom: 3px solid #1e3a8a; padding: 30px 40px; }
    .logo { width: 80px; height: 80px; background: #1e3a8a; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
    h1 { margin: 0 0 5px 0; font-size: 24px; color: #1e3a8a; font-weight: bold; }
    h2 { margin: 0; font-size: 20px; color: #1e3a8a; font-weight: bold; letter-spacing: 1px; }
    h3 { margin: 0 0 15px 0; font-size: 16px; color: #1e3a8a; font-weight: bold; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px; display: inline-block; }
    .section { padding: 25px 40px; border-bottom: 1px solid #e5e7eb; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .info-item { margin: 5px 0; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 8px; text-align: center; }
    th { background: #f3f4f6; }
    .signatures { display: flex; justify-content: space-between; margin: 30px 0; }
    .signature { text-align: center; width: 150px; }
    .signature-line { height: 60px; border-bottom: 1px solid #000; margin-bottom: 5px; }
    .seal { width: 80px; height: 80px; border: 2px solid #1e3a8a; border-radius: 50%; margin: 20px auto 10px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #1e3a8a; }
    .footer-section { padding: 40px 40px 30px 40px; margin-top: 100px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">LOGO</div>
    <h1>XYZ COLLEGE OF ENGINEERING</h1>
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280;">Autonomous Institution | NAAC A+ Accredited</p>
    <h2>VERIFIED STUDENT ACHIEVEMENT PORTFOLIO</h2>
  </div>
  
  <div class="section">
    <h3>STUDENT INFORMATION</h3>
    <div class="info-grid">
      <div>
        <div class="info-item"><strong>Register Number:</strong> ${studentData.regNo}</div>
        <div class="info-item"><strong>Full Name:</strong> ${studentData.fullName}</div>
        <div class="info-item"><strong>Department:</strong> ${studentData.department}</div>
      </div>
      <div>
        <div class="info-item"><strong>Year:</strong> ${studentData.year}</div>
        <div class="info-item"><strong>Program:</strong> ${studentData.program}</div>
      </div>
    </div>
  </div>
  
  <div class="section">
    <h3>ACADEMIC SUMMARY</h3>
    <div style="display: flex; gap: 30px; margin-bottom: 20px;">
      <div style="font-size: 14px;"><strong>CGPA:</strong> ${studentData.cgpa}</div>
      <div style="font-size: 14px;"><strong>Attendance:</strong> ${studentData.attendance}</div>
    </div>
    <table>
      <thead>
        <tr><th>Semester</th><th>GPA</th><th>Credits</th></tr>
      </thead>
      <tbody>
        ${semesterResults.map(sem => `<tr><td>${sem.semester}</td><td>${sem.gpa}</td><td>${sem.credits}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h3>ANALYTICS & SUMMARY</h3>
    <div class="info-grid">
      <div>
        <div class="info-item"><strong>Total Certificates:</strong> ${achievements.length}</div>
        <div class="info-item"><strong>Total Training Hours:</strong> 150</div>
      </div>
      <div>
        <div class="info-item"><strong>Credits Earned:</strong> 6</div>
        <div class="info-item"><strong>Graduate Attributes:</strong> Problem Solving, Teamwork, Communication, Technical Skills</div>
      </div>
    </div>
  </div>
  
  <div class="page-break"></div>
  
  <div class="section">
    <h3>VERIFIED ACHIEVEMENTS & CERTIFICATIONS</h3>
    <table>
      <thead>
        <tr>
          <th style="width: 8%;">Sl. No</th>
          <th style="width: 15%;">Activity Type</th>
          <th style="width: 30%;">Title / Certificate</th>
          <th style="width: 20%;">Issuing Body</th>
          <th style="width: 15%;">Date</th>
          <th style="width: 12%;">Verified</th>
        </tr>
      </thead>
      <tbody>
        ${achievements.map(ach => `<tr><td>${ach.sl}</td><td>${ach.type}</td><td>${ach.title}</td><td>${ach.issuer}</td><td>${ach.date}</td><td>${ach.verified ? '✓' : '✗'}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="footer-section">
    <div class="signatures">
      <div class="signature">
        <div class="signature-line"></div>
        <p style="margin: 0; font-size: 12px; font-weight: bold;">Student Signature</p>
      </div>
      <div class="signature">
        <div class="signature-line"></div>
        <p style="margin: 0; font-size: 12px; font-weight: bold;">Faculty Advisor</p>
      </div>
      <div class="signature">
        <div class="signature-line"></div>
        <p style="margin: 0; font-size: 12px; font-weight: bold;">HOD / Principal</p>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
      <div class="seal">COLLEGE SEAL</div>
      <p style="margin: 0; font-size: 11px; font-style: italic; color: #6b7280;">* This portfolio is system-generated and verified by XYZ College of Engineering *</p>
    </div>
  </div>
</body>
</html>`;
  
  try {
    console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000
    });
    
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    
    console.log('Setting content...');
    await page.setContent(htmlContent, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('Generating PDF...');
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });
    
    await browser.close();
    console.log('PDF generated successfully, size:', pdf.length);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${studentData.fullName.replace(/\s+/g, '_')}_Portfolio.pdf"`);
    res.setHeader('Content-Length', pdf.length);
    res.end(pdf, 'binary');
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'PDF generation failed: ' + error.message });
  }
});

// Generate Intermediate Portfolio PDF
app.post('/api/generate-intermediate-portfolio-pdf', authenticateToken, async (req, res) => {
  const { studentData, achievements, badges } = req.body;
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0.5in; }
    body { font-family: 'Inter', sans-serif; margin: 0; color: #333; background: white; }
    .container { border: 3px solid #0891b2; border-radius: 20px; overflow: hidden; }
    .banner { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 12px 25px; color: white; font-size: 13px; font-weight: 600; }
    .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #155e75 100%); padding: 30px; color: white; text-align: center; }
    h1 { margin: 0; font-size: 32px; font-weight: 900; }
    .content { display: flex; }
    .left-col { flex: 1; padding: 30px; background: #f8fafc; }
    .right-col { flex: 1.5; padding: 30px; }
    .info-card { background: white; padding: 25px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
    .achievement-card { padding: 25px; border-radius: 16px; margin-bottom: 20px; }
    .academics { background: #fef3c7; border: 2px solid #f59e0b; }
    .extracurricular { background: #dcfce7; border: 2px solid #22c55e; }
    .badges-card { background: #fce7f3; border: 2px solid #ec4899; }
    .badge { background: white; padding: 8px 16px; border-radius: 25px; font-size: 13px; font-weight: 600; color: #be185d; border: 2px solid #f9a8d4; margin: 5px; display: inline-block; }
    .summary { padding: 20px 25px; background: #e0f2fe; border-top: 2px solid #0891b2; display: flex; justify-content: space-around; }
    .footer { padding: 15px; text-align: center; background: #f8fafc; }
    h3 { color: #0891b2; font-size: 20px; margin: 0 0 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">
      Premium Intermediate Template - Enhanced Visual Analytics
    </div>
    
    <div class="header">
      <h1>Student Portfolio - Intermediate</h1>
    </div>
    
    <div class="content">
      <div class="left-col">
        <div class="info-card">
          <h3>Student Information</h3>
          <p><strong>Name:</strong> ${studentData.name}</p>
          <p><strong>Reg No:</strong> ${studentData.regNo}</p>
          <p><strong>Department:</strong> ${studentData.department}</p>
          <p><strong>Year:</strong> ${studentData.year}</p>
        </div>
        
        <div class="info-card">
          <h3>Progress</h3>
          <p><strong>Level:</strong> ${studentData.level}</p>
          <p><strong>Points:</strong> ${studentData.points}/${studentData.maxPoints}</p>
          <div style="width: 100%; height: 20px; background: #e0f2fe; border-radius: 10px; overflow: hidden;">
            <div style="width: ${(studentData.points / studentData.maxPoints) * 100}%; height: 100%; background: #0891b2;"></div>
          </div>
        </div>
      </div>
      
      <div class="right-col">
        <div class="achievement-card academics">
          <h3><span style="color: #f59e0b; margin-right: 8px;">📖</span>Academics</h3>
          ${achievements.academics.map(item => `
            <div style="margin-bottom: 12px;">
              <p style="margin: 0 0 4px 0; font-weight: 700;">• ${item.title}</p>
              <p style="margin: 0; font-size: 13px; color: #78716c;">${item.status} - ${item.date}</p>
            </div>
          `).join('')}
        </div>
        
        <div class="achievement-card extracurricular">
          <h3><span style="color: #8b5cf6; margin-right: 8px;">👤</span>Extracurricular</h3>
          ${achievements.extracurricular.map(item => `
            <div style="margin-bottom: 12px;">
              <p style="margin: 0 0 4px 0; font-weight: 700;">• ${item.title}</p>
              <p style="margin: 0; font-size: 13px; color: #6b7280;">${item.status} - ${item.date}</p>
            </div>
          `).join('')}
        </div>
        
        <div class="achievement-card badges-card">
          <h3><span style="color: #ec4899; margin-right: 8px;">★</span>Badges Earned</h3>
          <div>
            ${badges.map(badge => `<span class="badge">${badge}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
    
    <div class="summary">
      <div style="text-align: center;">
        <div style="font-size: 20px; font-weight: 900; color: #0891b2;">${achievements.academics.length + achievements.extracurricular.length}</div>
        <div style="font-size: 11px; color: #0e7490; font-weight: 600;">Achievements</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 20px; font-weight: 900; color: #0891b2;">${badges.length}</div>
        <div style="font-size: 11px; color: #0e7490; font-weight: 600;">Badges</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 20px; font-weight: 900; color: #0891b2;">${Math.round((studentData.points / studentData.maxPoints) * 100)}%</div>
        <div style="font-size: 11px; color: #0e7490; font-weight: 600;">Progress</div>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0; font-size: 13px; color: #6b7280;"><span style="color: #8b5cf6;">★</span> Generated via Smart Student Hub</p>
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
    res.setHeader('Content-Disposition', `attachment; filename="${studentData.name.replace(/\s+/g, '_')}_Intermediate_Portfolio.pdf"`);
    res.end(pdf, 'binary');
  } catch (error) {
    console.error('Intermediate PDF generation error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

// Generate Advanced Portfolio PDF
app.post('/api/generate-advanced-portfolio-pdf', authenticateToken, async (req, res) => {
  if (!puppeteer) {
    return res.status(500).json({ error: 'Puppeteer not available' });
  }
  
  const { studentData, certificates } = req.body;
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4; margin: 0.5in; }
    body { font-family: 'Inter', sans-serif; margin: 0; color: #333; background: white; }
    .header { background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%); padding: 40px; color: white; text-align: center; }
    h1 { margin: 0; font-size: 36px; font-weight: 900; }
    .content { padding: 30px; }
    .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .info-card { padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; }
    .achievements { margin-bottom: 30px; }
    .achievement-item { padding: 20px; margin-bottom: 15px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .badges { text-align: center; padding: 30px; background: #f8fafc; }
    .badge { display: inline-block; padding: 8px 16px; margin: 5px; background: #e0e7ff; color: #3730a3; border-radius: 20px; font-weight: 600; }
    .footer { text-align: center; padding: 20px; background: #f8fafc; color: #64748b; }
    h2 { color: #1e293b; font-size: 24px; margin-bottom: 20px; }
    h3 { color: #475569; font-size: 14px; text-transform: uppercase; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${studentData.name}</h1>
    <p style="font-size: 18px; margin: 10px 0 0 0;">Information Technology Student</p>
  </div>
  
  <div class="content">
    <h2>Academic Information</h2>
    <div class="info-grid">
      <div class="info-card">
        <h3>Registration</h3>
        <p style="font-size: 18px; font-weight: bold; margin: 0;">${studentData.regNo}</p>
      </div>
      <div class="info-card">
        <h3>Department</h3>
        <p style="font-size: 18px; font-weight: bold; margin: 0;">${studentData.department}</p>
      </div>
      <div class="info-card">
        <h3>Academic Year</h3>
        <p style="font-size: 18px; font-weight: bold; margin: 0;">${studentData.year}</p>
      </div>
      <div class="info-card">
        <h3>Level</h3>
        <p style="font-size: 18px; font-weight: bold; margin: 0;">${studentData.level}</p>
      </div>
    </div>
    
    <h2>Key Achievements</h2>
    <div class="achievements">
      ${certificates.map(cert => `
        <div class="achievement-item">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 8px 0;">${cert.certificate_name}</h3>
          <p style="margin: 0; color: #64748b;">Uploaded: ${new Date(cert.upload_date).toLocaleDateString()}</p>
        </div>
      `).join('')}
    </div>
  </div>
  
  <div class="badges">
    <h2>Badges & Level</h2>
    <div>
      <span class="badge">Innovator (${studentData.totalPoints} Points)</span>
      <span class="badge">Leader</span>
      <span class="badge">Mentor</span>
    </div>
    <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 12px; display: inline-block;">
      <h3 style="margin: 0 0 8px 0;">Current Level: ${studentData.level}</h3>
      <p style="margin: 0;">Total Points: ${studentData.totalPoints}</p>
    </div>
  </div>
  
  <div class="footer">
    <p>🎓 Digital Portfolio • Verified & Generated via Smart Student Hub</p>
    <p style="font-size: 12px; margin-top: 8px;">Last Updated: ${new Date().toLocaleDateString()}</p>
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
    res.setHeader('Content-Disposition', `attachment; filename="${studentData.name.replace(/\s+/g, '_')}_Advanced_Portfolio.pdf"`);
    res.end(pdf, 'binary');
  } catch (error) {
    console.error('Advanced PDF generation error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

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
    res.setHeader('Content-Disposition', `attachment; filename="${studentData.name.replace(/\s+/g, '_')}_Beginner_Portfolio.pdf"`);
    res.end(pdf, 'binary');
  } catch (error) {
    console.error('Beginner PDF generation error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});
