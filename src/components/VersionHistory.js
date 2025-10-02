import React, { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { motion } from 'framer-motion';
import { FaSave, FaHistory, FaDownload, FaTrash } from 'react-icons/fa';


const VersionHistory = () => {
  const { versions = [], saveVersion, loadVersion } = useResume();
  const [versionName, setVersionName] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleSaveVersion = () => {
    if (versionName.trim() && saveVersion) {
      saveVersion(versionName);
      setVersionName('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="form-section"
    >
      <h3>Version Control</h3>
      
      {/* Save New Version */}
      <div style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label>Save Current Version</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="Version name (e.g., Final Draft)"
              style={{ flex: 1 }}
            />
            <button 
              onClick={handleSaveVersion}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <FaSave /> Save
            </button>
          </div>
        </div>
      </div>

      {/* Toggle History */}
      <button 
        onClick={() => setShowHistory(!showHistory)}
        className="btn btn-secondary"
        style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}
      >
        <FaHistory /> {showHistory ? 'Hide' : 'Show'} History ({versions?.length || 0})
      </button>

      {/* Version History */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {!versions || versions.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No saved versions yet</p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {versions.map((version) => (
                <div key={version.id} style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{version.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(version.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <button 
                      onClick={() => loadVersion(version.id)}
                      className="btn btn-primary"
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default VersionHistory;