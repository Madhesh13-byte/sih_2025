# PostgreSQL Reports Integration Guide

## Setup Steps:

### 1. Database Setup
```sql
-- Run the SQL in reports_schema.sql to create the table
psql -U your_username -d your_database -f reports_schema.sql
```

### 2. Install Dependencies
```bash
cd server
npm install pg
```

### 3. Update Database Config
Edit `server/routes/reports-db.js` with your PostgreSQL credentials:
```javascript
const pool = new Pool({
  user: 'your_username',
  host: 'localhost', 
  database: 'your_database',
  password: 'your_password',
  port: 5432,
});
```

### 4. Add to Admin Dashboard
In `AdminDashboard.js`, add the import and route:
```javascript
import ReportsDB from './ReportsDB';

// Add this in the render section:
{currentView === 'reports-db' && (
  <ReportsDB setCurrentView={setCurrentView} setMessage={setAutoHideMessage} />
)}

// Add button in admin actions:
<button className="action-card" onClick={() => setCurrentView('reports-db')}>
  <FileText size={20} />
  <span>Database Reports</span>
</button>
```

### 5. Import CSS
In `ReportsDB.js`, add:
```javascript
import './styles/ReportsDB.css';
```

## API Endpoints:
- `GET /api/reports-db` - Get all reports
- `POST /api/reports-db` - Create new report  
- `GET /api/reports-db/:id` - Get specific report

## Database Schema:
- `id` - Primary key
- `title` - Report title
- `description` - Report description
- `report_type` - Category (academic, enrollment, etc.)
- `data` - JSON data for report content
- `created_at` - Timestamp