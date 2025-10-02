const htmlTemplates = {
  modern: {
    generate: (data, colorScheme = 'blue') => {
      const colors = {
        blue: { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6' },
        red: { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444' },
        green: { primary: '#059669', secondary: '#047857', accent: '#10b981' },
        purple: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6' }
      };
      const theme = colors[colorScheme] || colors.blue;

      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.personal?.name || 'Resume'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; background: white; }
        .header { background: ${theme.primary}; color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .contact-info { display: flex; justify-content: center; gap: 20px; margin-top: 20px; flex-wrap: wrap; }
        .contact-info span { font-size: 0.9em; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: ${theme.primary}; border-bottom: 2px solid ${theme.accent}; padding-bottom: 5px; margin-bottom: 15px; }
        .experience-item, .education-item, .project-item { margin-bottom: 20px; }
        .experience-item h3, .project-item h3 { color: ${theme.secondary}; margin-bottom: 5px; }
        .experience-item .company, .education-item .institution { font-weight: bold; color: #666; }
        .experience-item .date, .education-item .date { color: #888; font-size: 0.9em; }
        .skills { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill { background: ${theme.accent}; color: white; padding: 5px 12px; border-radius: 15px; font-size: 0.9em; }
        .responsibilities { margin-top: 10px; }
        .responsibilities li { margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>${data.personal?.name || 'Your Name'}</h1>
            <p>${data.summary || 'Professional Summary'}</p>
            <div class="contact-info">
                ${data.personal?.email ? `<span>📧 ${data.personal.email}</span>` : ''}
                ${data.personal?.phone ? `<span>📞 ${data.personal.phone}</span>` : ''}
                ${data.personal?.address ? `<span>📍 ${data.personal.address}</span>` : ''}
                ${data.personal?.linkedin ? `<span>🔗 LinkedIn</span>` : ''}
            </div>
        </header>
        
        <div class="content">
            ${data.experience?.length ? `
            <section class="section">
                <h2>Experience</h2>
                ${data.experience.map(exp => `
                <div class="experience-item">
                    <h3>${exp.role}</h3>
                    <div class="company">${exp.company}</div>
                    <div class="date">${exp.startDate} - ${exp.endDate}</div>
                    ${exp.responsibilities?.length ? `
                    <ul class="responsibilities">
                        ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                    </ul>
                    ` : ''}
                </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${data.education?.length ? `
            <section class="section">
                <h2>Education</h2>
                ${data.education.map(edu => `
                <div class="education-item">
                    <h3>${edu.degree}</h3>
                    <div class="institution">${edu.institution}</div>
                    <div class="date">${edu.startYear} - ${edu.endYear}</div>
                    ${edu.cgpa ? `<div>CGPA: ${edu.cgpa}</div>` : ''}
                </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${data.skills?.length ? `
            <section class="section">
                <h2>Skills</h2>
                <div class="skills">
                    ${data.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
                </div>
            </section>
            ` : ''}
            
            ${data.projects?.length ? `
            <section class="section">
                <h2>Projects</h2>
                ${data.projects.map(project => `
                <div class="project-item">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div><strong>Tech Stack:</strong> ${project.techStack}</div>
                    ${project.link ? `<div><strong>Link:</strong> <a href="${project.link}">${project.link}</a></div>` : ''}
                </div>
                `).join('')}
            </section>
            ` : ''}
        </div>
    </div>
</body>
</html>`;
    }
  },

  creative: {
    generate: (data, colorScheme = 'red') => {
      const colors = {
        blue: { primary: '#1e3a8a', secondary: '#3b82f6', accent: '#93c5fd' },
        red: { primary: '#991b1b', secondary: '#ef4444', accent: '#fca5a5' },
        green: { primary: '#14532d', secondary: '#22c55e', accent: '#86efac' },
        purple: { primary: '#581c87', secondary: '#a855f7', accent: '#c4b5fd' }
      };
      const theme = colors[colorScheme] || colors.red;

      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.personal?.name || 'Resume'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; background: linear-gradient(135deg, ${theme.accent}20, white); }
        .container { max-width: 900px; margin: 20px auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .sidebar { background: ${theme.primary}; color: white; padding: 40px 30px; width: 300px; float: left; min-height: 100vh; }
        .main-content { margin-left: 300px; padding: 40px; }
        .profile { text-align: center; margin-bottom: 30px; }
        .profile h1 { font-size: 1.8em; margin-bottom: 10px; }
        .profile p { opacity: 0.9; font-style: italic; }
        .contact-section { margin-bottom: 30px; }
        .contact-section h3 { margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; }
        .contact-item { margin-bottom: 8px; font-size: 0.9em; }
        .skills-sidebar { margin-bottom: 30px; }
        .skill-item { background: rgba(255,255,255,0.2); margin: 5px 0; padding: 8px 12px; border-radius: 20px; font-size: 0.85em; }
        .section { margin-bottom: 35px; }
        .section h2 { color: ${theme.primary}; font-size: 1.5em; margin-bottom: 20px; position: relative; }
        .section h2::after { content: ''; position: absolute; bottom: -5px; left: 0; width: 50px; height: 3px; background: ${theme.secondary}; }
        .timeline-item { position: relative; padding-left: 25px; margin-bottom: 25px; }
        .timeline-item::before { content: ''; position: absolute; left: 0; top: 5px; width: 12px; height: 12px; background: ${theme.secondary}; border-radius: 50%; }
        .timeline-item h3 { color: ${theme.secondary}; margin-bottom: 5px; }
        .timeline-item .meta { color: #666; font-size: 0.9em; margin-bottom: 10px; }
        .project-card { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid ${theme.secondary}; }
        @media (max-width: 768px) { .sidebar { width: 100%; float: none; } .main-content { margin-left: 0; } }
    </style>
</head>
<body>
    <div class="container">
        <aside class="sidebar">
            <div class="profile">
                <h1>${data.personal?.name || 'Your Name'}</h1>
                <p>${data.summary || 'Professional Summary'}</p>
            </div>
            
            <div class="contact-section">
                <h3>Contact</h3>
                ${data.personal?.email ? `<div class="contact-item">📧 ${data.personal.email}</div>` : ''}
                ${data.personal?.phone ? `<div class="contact-item">📞 ${data.personal.phone}</div>` : ''}
                ${data.personal?.address ? `<div class="contact-item">📍 ${data.personal.address}</div>` : ''}
                ${data.personal?.linkedin ? `<div class="contact-item">🔗 LinkedIn</div>` : ''}
            </div>
            
            ${data.skills?.length ? `
            <div class="skills-sidebar">
                <h3>Skills</h3>
                ${data.skills.map(skill => `<div class="skill-item">${skill}</div>`).join('')}
            </div>
            ` : ''}
        </aside>
        
        <main class="main-content">
            ${data.experience?.length ? `
            <section class="section">
                <h2>Experience</h2>
                ${data.experience.map(exp => `
                <div class="timeline-item">
                    <h3>${exp.role}</h3>
                    <div class="meta">${exp.company} • ${exp.startDate} - ${exp.endDate}</div>
                    ${exp.responsibilities?.length ? `
                    <ul>
                        ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                    </ul>
                    ` : ''}
                </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${data.education?.length ? `
            <section class="section">
                <h2>Education</h2>
                ${data.education.map(edu => `
                <div class="timeline-item">
                    <h3>${edu.degree}</h3>
                    <div class="meta">${edu.institution} • ${edu.startYear} - ${edu.endYear}</div>
                    ${edu.cgpa ? `<div>CGPA: ${edu.cgpa}</div>` : ''}
                </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${data.projects?.length ? `
            <section class="section">
                <h2>Projects</h2>
                ${data.projects.map(project => `
                <div class="project-card">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div><strong>Tech Stack:</strong> ${project.techStack}</div>
                    ${project.link ? `<div><strong>Link:</strong> <a href="${project.link}">${project.link}</a></div>` : ''}
                </div>
                `).join('')}
            </section>
            ` : ''}
        </main>
    </div>
</body>
</html>`;
    }
  },

  professional: {
    generate: (data, colorScheme = 'blue') => {
      const colors = {
        blue: { primary: '#1e40af', secondary: '#374151', accent: '#6b7280' },
        red: { primary: '#b91c1c', secondary: '#374151', accent: '#6b7280' },
        green: { primary: '#047857', secondary: '#374151', accent: '#6b7280' },
        purple: { primary: '#6d28d9', secondary: '#374151', accent: '#6b7280' }
      };
      const theme = colors[colorScheme] || colors.blue;

      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.personal?.name || 'Resume'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', serif; color: #333; background: #f5f5f5; }
        .container { max-width: 800px; margin: 20px auto; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid ${theme.primary}; padding: 30px; text-align: center; }
        .header h1 { font-size: 2.2em; color: ${theme.primary}; margin-bottom: 10px; }
        .header .title { font-size: 1.1em; color: ${theme.secondary}; margin-bottom: 15px; }
        .contact-bar { display: flex; justify-content: center; gap: 30px; font-size: 0.9em; flex-wrap: wrap; }
        .content { padding: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 1.3em; color: ${theme.primary}; border-bottom: 1px solid ${theme.accent}; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
        .entry { margin-bottom: 20px; }
        .entry-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
        .entry-title { font-weight: bold; color: ${theme.secondary}; }
        .entry-subtitle { color: ${theme.accent}; font-style: italic; }
        .entry-date { color: ${theme.accent}; font-size: 0.9em; }
        .entry-content { margin-top: 8px; }
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 5px; }
        .skill { padding: 3px 0; }
        .project-tech { color: ${theme.accent}; font-size: 0.9em; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>${data.personal?.name || 'Your Name'}</h1>
            <div class="title">${data.summary || 'Professional Summary'}</div>
            <div class="contact-bar">
                ${data.personal?.email ? `<span>${data.personal.email}</span>` : ''}
                ${data.personal?.phone ? `<span>${data.personal.phone}</span>` : ''}
                ${data.personal?.address ? `<span>${data.personal.address}</span>` : ''}
                ${data.personal?.linkedin ? `<span>LinkedIn Profile</span>` : ''}
            </div>
        </header>
        
        <div class="content">
            ${data.experience?.length ? `
            <section class="section">
                <h2 class="section-title">Professional Experience</h2>
                ${data.experience.map(exp => `
                <div class="entry">
                    <div class="entry-header">
                        <div>
                            <div class="entry-title">${exp.role}</div>
                            <div class="entry-subtitle">${exp.company}</div>
                        </div>
                        <div class="entry-date">${exp.startDate} - ${exp.endDate}</div>
                    </div>
                    ${exp.responsibilities?.length ? `
                    <div class="entry-content">
                        <ul>
                            ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${data.education?.length ? `
            <section class="section">
                <h2 class="section-title">Education</h2>
                ${data.education.map(edu => `
                <div class="entry">
                    <div class="entry-header">
                        <div>
                            <div class="entry-title">${edu.degree}</div>
                            <div class="entry-subtitle">${edu.institution}</div>
                        </div>
                        <div class="entry-date">${edu.startYear} - ${edu.endYear}</div>
                    </div>
                    ${edu.cgpa ? `<div class="entry-content">CGPA: ${edu.cgpa}</div>` : ''}
                </div>
                `).join('')}
            </section>
            ` : ''}
            
            ${data.skills?.length ? `
            <section class="section">
                <h2 class="section-title">Technical Skills</h2>
                <div class="skills-grid">
                    ${data.skills.map(skill => `<div class="skill">• ${skill}</div>`).join('')}
                </div>
            </section>
            ` : ''}
            
            ${data.projects?.length ? `
            <section class="section">
                <h2 class="section-title">Projects</h2>
                ${data.projects.map(project => `
                <div class="entry">
                    <div class="entry-title">${project.title}</div>
                    <div class="entry-content">
                        <p>${project.description}</p>
                        <div class="project-tech"><strong>Technologies:</strong> ${project.techStack}</div>
                        ${project.link ? `<div class="project-tech"><strong>Link:</strong> ${project.link}</div>` : ''}
                    </div>
                </div>
                `).join('')}
            </section>
            ` : ''}
        </div>
    </div>
</body>
</html>`;
    }
  },

  minimal: {
    generate: (data, colorScheme = 'blue') => {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.personal?.name || 'Resume'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        h1 { font-size: 2em; margin-bottom: 5px; }
        h2 { font-size: 1.2em; margin: 25px 0 10px 0; text-transform: uppercase; letter-spacing: 1px; }
        h3 { font-size: 1em; margin-bottom: 5px; }
        .contact { margin-bottom: 20px; font-size: 0.9em; }
        .contact span { margin-right: 20px; }
        .section { margin-bottom: 25px; }
        .entry { margin-bottom: 15px; }
        .entry-meta { color: #666; font-size: 0.9em; }
        .skills { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill { background: #f0f0f0; padding: 3px 8px; border-radius: 3px; font-size: 0.85em; }
        ul { margin-left: 20px; }
        li { margin-bottom: 3px; }
        a { color: #333; }
    </style>
</head>
<body>
    <header>
        <h1>${data.personal?.name || 'Your Name'}</h1>
        <div class="contact">
            ${data.personal?.email ? `<span>${data.personal.email}</span>` : ''}
            ${data.personal?.phone ? `<span>${data.personal.phone}</span>` : ''}
            ${data.personal?.address ? `<span>${data.personal.address}</span>` : ''}
        </div>
        ${data.summary ? `<p>${data.summary}</p>` : ''}
    </header>
    
    ${data.experience?.length ? `
    <section class="section">
        <h2>Experience</h2>
        ${data.experience.map(exp => `
        <div class="entry">
            <h3>${exp.role} - ${exp.company}</h3>
            <div class="entry-meta">${exp.startDate} - ${exp.endDate}</div>
            ${exp.responsibilities?.length ? `
            <ul>
                ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
            </ul>
            ` : ''}
        </div>
        `).join('')}
    </section>
    ` : ''}
    
    ${data.education?.length ? `
    <section class="section">
        <h2>Education</h2>
        ${data.education.map(edu => `
        <div class="entry">
            <h3>${edu.degree} - ${edu.institution}</h3>
            <div class="entry-meta">${edu.startYear} - ${edu.endYear}${edu.cgpa ? ` • CGPA: ${edu.cgpa}` : ''}</div>
        </div>
        `).join('')}
    </section>
    ` : ''}
    
    ${data.skills?.length ? `
    <section class="section">
        <h2>Skills</h2>
        <div class="skills">
            ${data.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
        </div>
    </section>
    ` : ''}
    
    ${data.projects?.length ? `
    <section class="section">
        <h2>Projects</h2>
        ${data.projects.map(project => `
        <div class="entry">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="entry-meta">Tech: ${project.techStack}</div>
            ${project.link ? `<div class="entry-meta">Link: <a href="${project.link}">${project.link}</a></div>` : ''}
        </div>
        `).join('')}
    </section>
    ` : ''}
</body>
</html>`;
    }
  }
};

export { htmlTemplates };