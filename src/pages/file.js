import React, { useState } from 'react';
import { Button, Form, ProgressBar, Alert, Stack, Spinner } from 'react-bootstrap';
import AuthService from "../services/auth.service";

const FileUploadComponent = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState(null);

  const maxFileSizeMB = 100; // 100MB limit

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.size > maxFileSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxFileSizeMB}MB limit`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
    setDatasetInfo(null);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    try {
      const token = AuthService.getCurrentUserCookie()?.accessToken;
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:8081/ocean_api/api/dataset', true);
      xhr.setRequestHeader('x-access-token', token);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        
        try {
          const response = xhr.responseText ? JSON.parse(xhr.responseText) : {};
          
          if (xhr.status === 200 || xhr.status === 201) {
            if (response.id) {
              // Parse the upload date safely
              let uploadDate;
              try {
                uploadDate = response.uploadDate 
                  ? new Date(response.uploadDate).toLocaleString() 
                  : 'Just now';
              } catch (e) {
                uploadDate = 'Just now';
              }

              setDatasetInfo({
                id: response.id,
                originalName: response.name || file.name,
                downloadUrl: response.url,
                size: response.size || (file.size / 1024 / 1024).toFixed(2) + ' MB',
                uploadDate: uploadDate  // Now properly formatted or fallback
              });
              setSuccess(true);
              if (onUploadSuccess) onUploadSuccess(response.id);
            } else {
              throw new Error('Server response missing required fields');
            }
          } else {
            throw new Error(response.message || `Upload failed with status ${xhr.status}`);
          }
        } catch (err) {
          console.error('Error processing response:', err, xhr.responseText);
          setError(err.message || 'Failed to process server response');
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setError('Network error. Please check your connection and try again.');
      };

      xhr.ontimeout = () => {
        setIsUploading(false);
        setError('Request timed out. Please try again.');
      };

      xhr.timeout = 30000;
      xhr.send(formData);
    } catch (err) {
      setIsUploading(false);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="mb-4 p-4 border rounded">
      <h4 className="mb-3">Upload File</h4>
      
      {error && (
        <Alert variant="danger" className="mb-3" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Upload Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {success && datasetInfo && (
        <Alert variant="success" className="mb-3">
          <Alert.Heading>Upload Successful!</Alert.Heading>
          <Stack gap={2}>
            <div><strong>File:</strong> {datasetInfo.originalName}</div>
            <div><strong>File ID:</strong> <code>{datasetInfo.id}</code></div>
            <div><strong>Size:</strong> {datasetInfo.size}</div>
            <div><strong>Uploaded:</strong> {datasetInfo.uploadDate}</div>
            {datasetInfo.downloadUrl && (
              <div>
                <strong>Download URL:</strong>{' '}
                <a href={datasetInfo.downloadUrl} target="_blank" rel="noopener noreferrer">
                  {datasetInfo.downloadUrl}
                </a>
              </div>
            )}
          </Stack>
        </Alert>
      )}

      {/* Rest of your component remains the same */}
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Select any file to upload</Form.Label>
        <Form.Control 
          type="file" 
          onChange={handleFileChange} 
          disabled={isUploading}
        />
        <Form.Text muted>
          Maximum file size: {maxFileSizeMB}MB
        </Form.Text>
      </Form.Group>

      {file && (
        <div className="mb-3 p-3 bg-light rounded">
          <Stack direction="horizontal" gap={3}>
            <div>
              <p className="mb-1"><strong>Selected File:</strong></p>
              <p className="mb-1 text-truncate" style={{maxWidth: '300px'}}>
                {file.name}
              </p>
              <p className="mb-0 text-muted">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={() => setFile(null)}
              disabled={isUploading}
              className="ms-auto"
            >
              Clear
            </Button>
          </Stack>
        </div>
      )}

      {isUploading && (
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <span>Uploading {file?.name}</span>
            <span>{uploadProgress}%</span>
          </div>
          <ProgressBar 
            now={uploadProgress} 
            striped 
            animated 
            variant={uploadProgress === 100 ? 'success' : 'primary'}
            className="mb-2"
          />
          {uploadProgress === 100 && (
            <div className="text-center text-muted">
              <Spinner animation="border" size="sm" className="me-2" />
              Processing your file...
            </div>
          )}
        </div>
      )}

      <div className="d-grid gap-2">
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!file || isUploading}
          size="lg"
        >
          {isUploading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
              Uploading...
            </>
          ) : 'Upload File'}
        </Button>
      </div>
    </div>
  );
};

export default FileUploadComponent;