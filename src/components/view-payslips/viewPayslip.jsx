import React, { useState, useEffect } from 'react';
import './viewPayslip.css';

const ViewPayslips = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [wordFiles, setWordFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/listFiles');
        if (!response.ok) throw new Error('Failed to fetch file list');
        const data = await response.json();
        setPdfFiles(data.pdfFiles);
        setWordFiles(data.wordFiles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  
  const filterFiles = (files) => {
    return files.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="payslip-container">
      <h2 className="payslip-heading">View Payslips</h2>

   
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Payslip Number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p className="loading-message">Loading files...</p>}
      {error && <p className="error-message">{error}</p>}

      
      <div className="file-section">
        <div className="file-category">
          <h3 className="file-list-heading">PDF Files</h3>
          <div className="file-list">
            {pdfFiles.length === 0 ? (
              <p>No PDF files available</p>
            ) : (
              filterFiles(pdfFiles).map((file, index) => (
                <div key={index} className="file-card">
                  <a
                    href={`http://localhost:5000${file.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    <p>{file.name}</p>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="file-category">
          <h3 className="file-list-heading">Word Files</h3>
          <div className="file-list">
            {wordFiles.length === 0 ? (
              <p>No Word files available</p>
            ) : (
              filterFiles(wordFiles).map((file, index) => (
                <div key={index} className="file-card">
                  <a
                    href={`http://localhost:5000${file.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-link"
                    download
                  >
                    <p>{file.name}</p>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPayslips;
