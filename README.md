# Resume Builder Application

A comprehensive resume builder with multiple templates, PDF export, and resume analysis features.

## Features

- **7 Professional Templates**: Professional, Modern, Creative, Minimal, Executive, Academic, and Tech
- **Complete Resume Sections**: Personal Info, Summary, Skills, Certifications, Work Experience, Education, Projects
- **PDF Export**: Download your resume as a high-quality PDF
- **Resume Analysis**: Get a score and suggestions to improve your resume
- **Multiple Export Formats**: PDF, HTML, JSON, and QR Code
- **Responsive Design**: Works on desktop and mobile devices

## Installation

### Option 1: Using the batch file (Windows)
1. Double-click `install-dependencies.bat`
2. Wait for installation to complete

### Option 2: Manual installation
1. Open command prompt in the project directory
2. Run: `npm install`

## Running the Application

1. Open command prompt in the project directory
2. Run: `npm start`
3. Open your browser to `http://localhost:3000`

## How to Use

1. **Start with Personal Info**: Fill in your contact details
2. **Add Summary**: Write a professional summary
3. **Add Skills**: List your technical and soft skills
4. **Add Certifications**: Include any professional certifications
5. **Add Work Experience**: Detail your work history
6. **Add Education**: Include your educational background
7. **Add Projects**: Showcase your projects
8. **Choose Template**: Select from 7 different templates
9. **Download**: Export as PDF or other formats

## Templates Available

1. **Professional** - Clean and formal design for corporate roles
2. **Modern** - Contemporary design with clean lines
3. **Creative** - Artistic design for creative professionals
4. **Minimal** - Simple and elegant focusing on content
5. **Executive** - Sophisticated design for senior positions
6. **Academic** - Traditional format for academic positions
7. **Tech** - Modern tech-focused design with code elements

## Export Options

- **PDF Download** - High-quality PDF for printing and sharing
- **HTML Export** - Web-ready HTML file
- **JSON Export** - Data backup in JSON format
- **QR Code** - Generate QR code for easy sharing
- **Share Link** - Direct sharing via web

## Resume Analysis

The built-in analyzer checks:
- Contact information completeness (20 points)
- Professional summary quality (15 points)
- Work experience details (25 points)
- Skills variety (20 points)
- Education background (10 points)
- Project showcase (10 points)

## Dependencies

- React 18.2.0
- html2pdf.js - PDF generation
- qrcode - QR code generation
- react-hot-toast - Notifications
- react-icons - UI icons

## Project Structure

```
src/
├── components/
│   ├── forms/           # Form components for each section
│   ├── templates/       # Resume template components
│   ├── ExportButtons.js # Export functionality
│   ├── ResumePreview.js # Live preview
│   ├── ResumeScorer.js  # Resume analysis
│   └── TemplateSelector.js # Template selection
├── context/
│   └── ResumeContext.js # Global state management
├── pages/
│   └── ResumeBuilderPage.js # Main application page
└── App.js              # Root component
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.