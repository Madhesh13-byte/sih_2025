// controllers/subjectController.js
const Subject = require('../models/Subject');
const csv = require('csv-parser');
const fs = require('fs');

class SubjectController {
  constructor(db) {
    this.subjectModel = new Subject(db);
  }

  async getAll(req, res) {
    try {
      const subjects = await this.subjectModel.getAll();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: 'Database error: ' + error.message });
    }
  }

  async create(req, res) {
    try {
      const { subject_code, subject_name, department, year, semester, credits } = req.body;
      
      if (!subject_code || !subject_name || !department || !year || !semester) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const subject = await this.subjectModel.create(req.body);
      res.json(subject);
    } catch (error) {
      res.status(500).json({ error: 'Database error: ' + error.message });
    }
  }

  async deleteAll(req, res) {
    try {
      const deletedCount = await this.subjectModel.deleteAll();
      res.json({ message: `Deleted ${deletedCount} subjects successfully` });
    } catch (error) {
      res.status(500).json({ error: 'Database error: ' + error.message });
    }
  }

  async deleteById(req, res) {
    try {
      const deleted = await this.subjectModel.deleteById(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Subject not found' });
      }
      
      res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Database error: ' + error.message });
    }
  }

  async importCSV(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
      }

      const subjects = [];
      
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          const values = Object.values(data);
          subjects.push({
            subject_code: values[0] || '',
            subject_name: values[1] || '',
            department: values[2] || 'IT',
            year: values[3] || '1',
            semester: values[4] || '1',
            credits: values[5] || '3'
          });
        })
        .on('end', async () => {
          if (subjects.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'No valid subjects found' });
          }

          const imported = await this.subjectModel.bulkCreate(subjects);
          
          fs.unlinkSync(req.file.path);
          res.json({ message: `${imported} subjects imported successfully` });
        })
        .on('error', (error) => {
          fs.unlinkSync(req.file.path);
          res.status(500).json({ error: 'CSV processing failed' });
        });
    } catch (error) {
      res.status(500).json({ error: 'Import failed: ' + error.message });
    }
  }

  getTemplate(req, res) {
    const csvContent = 'subject_code,subject_name,department,year,semester,credits\n' +
                      'CS101,Programming Fundamentals,CSE,1,1,4\n' +
                      'MA101,Engineering Mathematics,CSE,1,1,4\n' +
                      'PH101,Engineering Physics,CSE,1,1,3';
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=subjects_template.csv');
    res.send(csvContent);
  }
}

module.exports = SubjectController;