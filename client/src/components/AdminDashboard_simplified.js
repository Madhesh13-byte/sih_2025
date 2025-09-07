import { Trash2, ArrowLeft } from 'lucide-react';

function ClassManagement({ setCurrentView, setMessage }) {
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    department: '', year: '', section: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/classes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Failed to fetch classes');
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchClasses();
        setFormData({ department: '', year: '', section: '' });
        setShowForm(false);
        setMessage('Class created successfully!');
      }
    } catch (error) {
      setMessage('Error creating class');
    }
  };

  return (
    <div className="class-management">
      <div className="form-header">
        <button className="back-btn" onClick={() => setCurrentView('main')}>
          <ArrowLeft size={16} />
        </button>
        <h2>Class Management</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          + Create Class
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <form onSubmit={handleCreateClass} className="modern-form class-form">
            <div className="form-header-modern">
              <h3>Create New Class</h3>
              <button type="button" className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <div className="form-body">
              <div className="form-row">
                <div className="select-group-modern">
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="">Select Dept</option>
                    <option value="IT">Information Technology</option>
                    <option value="CSE">Computer Science Engineering</option>
                    <option value="AIDS">Artificial Intelligence & Data Science</option>
                    <option value="MECH">Mechanical Engineering</option>
                    <option value="EEE">Electrical & Electronics Engineering</option>
                    <option value="ECE">Electronics & Communication Engineering</option>
                    <option value="CIVIL">Civil Engineering</option>
                  </select>
                  <label>Department</label>
                </div>
                
                <div className="select-group-modern">
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="I">I Year</option>
                    <option value="II">II Year</option>
                    <option value="III">III Year</option>
                    <option value="IV">IV Year</option>
                  </select>
                  <label>Year</label>
                </div>
                
                <div className="select-group-modern">
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    required
                  >
                    <option value="">Select Section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                  <label>Section</label>
                </div>
              </div>
            </div>
            
            <div className="form-actions-modern">
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="create-btn">Create Class</button>
            </div>
          </form>
        </div>
      )}

      <div className="classes-grid">
        {classes.map(classData => (
          <div key={classData.id} className="class-card">
            <div className="class-header">
              <h3>{classData.department} {classData.year} {classData.section}</h3>
              <span className="class-note">Students and subjects mapped via assignments</span>
            </div>
            
            <div className="class-info">
              <p><strong>Department:</strong> {classData.department}</p>
              <p><strong>Year:</strong> {classData.year}</p>
              <p><strong>Section:</strong> {classData.section}</p>
            </div>
            
            <button 
              className="delete-btn" 
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this class?')) {
                  try {
                    const response = await fetch(`http://localhost:5000/api/classes/${classData.id}`, {
                      method: 'DELETE',
                      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    if (response.ok) {
                      fetchClasses();
                      setMessage('Class deleted successfully!');
                    }
                  } catch (error) {
                    setMessage('Error deleting class');
                  }
                }
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      
      {classes.length === 0 && (
        <div className="empty-state">
          <p>No classes created yet. Create your first class to get started.</p>
        </div>
      )}
    </div>
  );
}