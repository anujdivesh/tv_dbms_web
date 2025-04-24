import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Row, Col, ProgressBar, Spinner } from 'react-bootstrap';
import AuthService from "../services/auth.service";
import { get_url } from './urls';
import { useNavigate } from 'react-router-dom';

const Metadata = () => {
  const navigate = useNavigate();
  // Main form state
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    data_type_id: '',
    comment: '',
    temporal_coverage_from: '',
    temporal_coverage_to: '',
    language: 'en',
    version: 'v1.0',
    project_id: '',
    west_bounding_box: '',
    east_bounding_box: '',
    south_bounding_box: '',
    north_bounding_box: '',
    coordinate_reference_system: 'EPSG:4326',
    contact_id: '',
    publisher_id: '',
    created_by: "Tuvalu Meteorological Service",
    country_id: '',
    access_constraint: 'None',
    license: 'Open Data Commons Open Database License (ODbL)',
    acknowledgement: '',
    history: '',
    funding: '',
    references: '',
    is_restricted: false,
    topic_ids: [],
    keyword_ids: [],
    canonical_url: '',
    has_fileupload: true
  });

  // File upload state
  const [fileUploadOption, setFileUploadOption] = useState('upload');
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
  const [fileError, setFileError] = useState(null);

  // Data loading state
  const [dataTypes, setDataTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [boundingBoxes, setBoundingBoxes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedBoundingBox, setSelectedBoundingBox] = useState(null);

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = AuthService.getCurrentUserCookie()?.accessToken;
        if (!token) throw new Error('Authentication required');

        const [
          dataTypesResponse, 
          projectsResponse, 
          contactsResponse,
          publishersResponse, 
          boundingBoxesResponse, 
          topicsResponse,
          keywordsResponse
        ] = await Promise.all([
          fetch(get_url('root-path')+'/ocean_api/api/data_type', { headers: { 'x-access-token': token } }),
          fetch(get_url('root-path')+'/ocean_api/api/projects', { headers: { 'x-access-token': token } }),
          fetch(get_url('root-path')+'/ocean_api/api/contacts', { headers: { 'x-access-token': token } }),
          fetch(get_url('root-path')+'/ocean_api/api/publishers', { headers: { 'x-access-token': token } }),
          fetch(get_url('root-path')+'/ocean_api/api/bounding_box', { headers: { 'x-access-token': token } }),
          fetch(get_url('root-path')+'/ocean_api/api/topics', { headers: { 'x-access-token': token } }),
          fetch(get_url('root-path')+'/ocean_api/api/keywords', { headers: { 'x-access-token': token } })
        ]);

        const [
          dataTypesData, 
          projectsData, 
          contactsData,
          publishersData, 
          boundingBoxesData, 
          topicsData,
          keywordsData
        ] = await Promise.all([
          dataTypesResponse.json(),
          projectsResponse.json(),
          contactsResponse.json(),
          publishersResponse.json(),
          boundingBoxesResponse.json(),
          topicsResponse.json(),
          keywordsResponse.json()
        ]);

        setDataTypes(dataTypesData);
        setProjects(projectsData);
        setContacts(contactsData);
        setPublishers(publishersData);
        setBoundingBoxes(boundingBoxesData);
        setTopics(topicsData);
        setKeywords(keywordsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handlers
  const handleBoundingBoxChange = (e) => {
    const selectedBoundingBoxId = e.target.value;
    if (!selectedBoundingBoxId) {
      setSelectedBoundingBox(null);
      setFormData(prev => ({
        ...prev,
        west_bounding_box: '',
        east_bounding_box: '',
        south_bounding_box: '',
        north_bounding_box: '',
        coordinate_reference_system: 'EPSG:4326'
      }));
      return;
    }

    const selectedBox = boundingBoxes.find(box => box.id.toString() === selectedBoundingBoxId);
    setSelectedBoundingBox(selectedBox);
    
    setFormData(prev => ({
      ...prev,
      west_bounding_box: selectedBox?.west_bound_longitude || '',
      east_bounding_box: selectedBox?.east_bound_longitude || '',
      south_bounding_box: selectedBox?.south_bound_latitude || '',
      north_bounding_box: selectedBox?.north_bound_latitude || '',
      coordinate_reference_system: selectedBox?.crs || 'EPSG:4326'
    }));
  };

  const handleTopicChange = (e) => {
    const { value, checked } = e.target;
    const topicId = parseInt(value);
    
    setFormData(prev => {
      let newTopicIds = [...prev.topic_ids];
      if (checked) {
        newTopicIds.push(topicId);
      } else {
        newTopicIds = newTopicIds.filter(id => id !== topicId);
      }
      return { ...prev, topic_ids: newTopicIds };
    });
  };

  const handleKeywordChange = (e) => {
    const { value, checked } = e.target;
    const keywordId = parseInt(value);
    
    setFormData(prev => {
      let newKeywordIds = [...prev.keyword_ids];
      if (checked) {
        newKeywordIds.push(keywordId);
      } else {
        newKeywordIds = newKeywordIds.filter(id => id !== keywordId);
      }
      return { ...prev, keyword_ids: newKeywordIds };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // When manually changing any bounding box field, clear the selected bounding box preset
    if (['west_bounding_box', 'east_bounding_box', 'south_bounding_box', 'north_bounding_box'].includes(name)) {
      setSelectedBoundingBox(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileOptionChange = (e) => {
    const option = e.target.value;
    setFileUploadOption(option);
    setFileError(null);
    setFileUploadSuccess(false);
    
    setFormData(prev => ({
      ...prev,
      has_fileupload: option === 'upload',
      canonical_url: option === 'upload' ? '' : prev.canonical_url
    }));
  };

  const handleFileUpload = async () => {
    if (!file) {
      setFileError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setFileError(null);
    setFileUploadSuccess(false);
    setUploadProgress(0);

    try {
      const token = AuthService.getCurrentUserCookie()?.accessToken;
      if (!token) throw new Error('Authentication required');

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', get_url('root-path') + '/ocean_api/api/dataset', true);
      xhr.setRequestHeader('x-access-token', token);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status === 200 || xhr.status === 201) {
            setFileUploadSuccess(true);
            setFormData(prev => ({
              ...prev,
              canonical_url: response.downloadUrl || response.canonical_url || '',
              has_fileupload: true
            }));
          } else {
            throw new Error(response.message || 'Upload failed');
          }
        } catch (err) {
          setFileError(err.message || 'Failed to process upload');
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setFileError('Network error during upload');
      };

      xhr.send(formData);
    } catch (err) {
      setIsUploading(false);
      setFileError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = AuthService.getCurrentUserCookie()?.accessToken;
      if (!token) throw new Error('Authentication required');

      // Validate file options
      if (fileUploadOption === 'upload' && !fileUploadSuccess) {
        throw new Error('Please complete the file upload first');
      }
      
      if (fileUploadOption === 'path' && !formData.canonical_url) {
        throw new Error('Please provide a valid URL for the data file');
      }

      if (fileUploadOption === 'upload' && !formData.canonical_url) {
        throw new Error('File upload did not return a valid URL');
      }

      // Prepare the payload
      const payload = {
        ...formData,
        data_type_id: parseInt(formData.data_type_id),
        project_id: parseInt(formData.project_id),
        contact_id: parseInt(formData.contact_id),
        publisher_id: parseInt(formData.publisher_id),
        topic_ids: formData.topic_ids.map(id => parseInt(id)),
        keyword_ids: formData.keyword_ids.map(id => parseInt(id)),
        has_fileupload: fileUploadOption === 'upload',
        canonical_url: formData.canonical_url,
        country_id : "TV"
      };

      const response = await fetch(get_url('root-path') + '/ocean_api/api/metadata/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(payload)
      });
     
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit metadata');
      }

      setSuccess(true);
      // Reset form
      setFormData({
        title: '',
        abstract: '',
        data_type_id: '',
        comment: '',
        temporal_coverage_from: '',
        temporal_coverage_to: '',
        language: 'en',
        version: 'v1.0',
        project_id: '',
        west_bounding_box: '',
        east_bounding_box: '',
        south_bounding_box: '',
        north_bounding_box: '',
        coordinate_reference_system: 'EPSG:4326',
        contact_id: '',
        publisher_id: '',
        created_by: 'Tuvalu Meteorological Service',
        country_id: '',
        access_constraint: 'None',
        license: 'Open Data Commons Open Database License (ODbL)',
        acknowledgement: '',
        history: '',
        funding: '',
        references: '',
        is_restricted: false,
        topic_ids: [],
        keyword_ids: [],
        canonical_url: '',
        has_fileupload: true
      });
      setFile(null);
      setFileUploadSuccess(false);
      setFileUploadOption('upload');
      setSelectedBoundingBox(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4" style={{ textAlign: 'left' }}>
      <div className="d-flex align-items-center mb-4">
        <h2 className="mb-0 me-3">Add New Metadata</h2>
        <Button 
          variant="outline-danger"
          size="sm"
          onClick={() => navigate('/oceandata/edit')}
        >
          Delete Metadata
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Metadata submitted successfully!</Alert>}

      {/* File Upload Section */}
      <div className="mb-4 p-4 border rounded" style={{ width: '50%',backgroundColor:'lightblue' }}>
        <h4 className="mb-3">Data File</h4>
        
        <Form.Group className="mb-3">
          <Form.Label>How would you like to provide the data file?</Form.Label>
          <div>
            <Form.Check
              type="radio"
              id="upload-option"
              label="Upload a file"
              name="fileOption"
              value="upload"
              checked={fileUploadOption === 'upload'}
              onChange={handleFileOptionChange}
              inline
            />
            <Form.Check
              type="radio"
              id="path-option"
              label="Provide a URL"
              name="fileOption"
              value="path"
              checked={fileUploadOption === 'path'}
              onChange={handleFileOptionChange}
              inline
            />
          </div>
        </Form.Group>

        {fileUploadOption === 'upload' ? (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Select file to upload</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={isUploading}
              />
              <Form.Text muted>Maximum file size: 2000MB</Form.Text>
            </Form.Group>

            {file && (
              <div className="mb-3">
                <p>Selected file: <strong>{file.name}</strong></p>
                <p>Size: <strong>{(file.size / 1024 / 1024).toFixed(2)} MB</strong></p>
                <Button
                  variant="primary"
                  onClick={handleFileUpload}
                  disabled={isUploading || fileUploadSuccess}
                >
                  {isUploading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Uploading...
                    </>
                  ) : fileUploadSuccess ? (
                    '✓ Uploaded'
                  ) : (
                    'Upload File'
                  )}
                </Button>
              </div>
            )}

            {isUploading && (
              <div className="mb-3">
                <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
              </div>
            )}

            {fileUploadSuccess && (
              <Alert variant="success" className="mb-3">
                File uploaded successfully! URL: {formData.canonical_url}
              </Alert>
            )}

            {fileError && (
              <Alert variant="danger" className="mb-3">
                {fileError}
              </Alert>
            )}
          </>
        ) : (
          <Form.Group className="mb-3">
            <Form.Label>Enter file URL</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://example.com/data/file.csv"
              value={formData.canonical_url}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                canonical_url: e.target.value,
                has_fileupload: false
              }))}
              required={fileUploadOption === 'path'}
            />
          </Form.Group>
        )}
      </div>

      {/* Metadata Form */}
      <Form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Title <span style={{color:"red"}}>*</span></Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Abstract <span style={{color:"red"}}>*</span></Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="abstract"
            value={formData.abstract}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Data Type <span style={{color:"red"}}>*</span></Form.Label>
          {loadingData ? (
            <Form.Control type="text" placeholder="Loading data types..." disabled />
          ) : (
            <Form.Select
              name="data_type_id"
              value={formData.data_type_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a data type</option>
              {dataTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.datatype_name} ({type.datatype_code})
                </option>
              ))}
            </Form.Select>
          )}
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Project <span style={{color:"red"}}>*</span></Form.Label>
          {loadingData ? (
            <Form.Control type="text" placeholder="Loading projects..." disabled />
          ) : (
            <Form.Select
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name} ({project.project_code})
                </option>
              ))}
            </Form.Select>
          )}
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Contact <span style={{color:"red"}}>*</span></Form.Label>
          {loadingData ? (
            <Form.Control type="text" placeholder="Loading contacts..." disabled />
          ) : (
            <Form.Select
              name="contact_id"
              value={formData.contact_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name} ({contact.position})
                </option>
              ))}
            </Form.Select>
          )}
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Publisher <span style={{color:"red"}}>*</span></Form.Label>
          {loadingData ? (
            <Form.Control type="text" placeholder="Loading publishers..." disabled />
          ) : (
            <Form.Select
              name="publisher_id"
              value={formData.publisher_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a publisher</option>
              {publishers.map((publisher) => (
                <option key={publisher.id} value={publisher.id}>
                  {publisher.name}
                </option>
              ))}
            </Form.Select>
          )}
        </Form.Group>

  

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Comment</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="comment"
            value={formData.comment}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Temporal Coverage From <span style={{color:"red"}}>*</span></Form.Label>
          <Form.Control
            type="date"
            name="temporal_coverage_from"
            value={formData.temporal_coverage_from}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Temporal Coverage To <span style={{color:"red"}}>*</span></Form.Label>
          <Form.Control
            type="date"
            name="temporal_coverage_to"
            value={formData.temporal_coverage_to}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Language</Form.Label>
          <Form.Control
            type="text"
            name="language"
            value={formData.language}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Version</Form.Label>
          <Form.Control
            type="text"
            name="version"
            value={formData.version}
            onChange={handleChange}
          />
        </Form.Group>

        <h5 className="mt-4">Bounding Box Coordinates</h5>
        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Bounding Box</Form.Label>
          {loadingData ? (
            <Form.Control type="text" placeholder="Loading bounding boxes..." disabled />
          ) : (
            <Form.Select
              name="bounding_box_preset"
              onChange={handleBoundingBoxChange}
              value={selectedBoundingBox?.id || ''}
            >
              <option value="">Select a bounding box preset</option>
              {boundingBoxes.map((box) => (
                <option key={box.id} value={box.id}>
                  {box.name}
                </option>
              ))}
            </Form.Select>
          )}
        </Form.Group>
        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>West Longitude</Form.Label>
          <Form.Control
            type="number"
            step="0.000001"
            name="west_bounding_box"
            value={formData.west_bounding_box}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>East Longitude</Form.Label>
          <Form.Control
            type="number"
            step="0.000001"
            name="east_bounding_box"
            value={formData.east_bounding_box}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>South Latitude</Form.Label>
          <Form.Control
            type="number"
            step="0.000001"
            name="south_bounding_box"
            value={formData.south_bounding_box}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>North Latitude</Form.Label>
          <Form.Control
            type="number"
            step="0.000001"
            name="north_bounding_box"
            value={formData.north_bounding_box}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Coordinate Reference System</Form.Label>
          <Form.Control
            type="text"
            name="coordinate_reference_system"
            value={formData.coordinate_reference_system}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Created By</Form.Label>
          <Form.Control
            type="text"
            name="created_by"
            value={formData.created_by}
            onChange={handleChange}
          />
        </Form.Group>

        <h5 className="mt-4">License & Constraints</h5>
        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Access Constraint</Form.Label>
          <Form.Control
            type="text"
            name="access_constraint"
            value={formData.access_constraint}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>License</Form.Label>
          <Form.Control
            type="text"
            name="license"
            value={formData.license}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Acknowledgement</Form.Label>
          <Form.Control
            type="text"
            name="acknowledgement"
            value={formData.acknowledgement}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>History</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="history"
            value={formData.history}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>Funding</Form.Label>
          <Form.Control
            type="text"
            name="funding"
            value={formData.funding}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" style={{ width: '50%' }}>
          <Form.Label>References</Form.Label>
          <Form.Control
            type="text"
            name="references"
            value={formData.references}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Topics</Form.Label>
          {loadingData ? (
            <Form.Control type="text" placeholder="Loading topics..." disabled />
          ) : (
            <Row>
              {topics.map((topic) => (
                <Col key={topic.id} xs={12} sm={6} md={4} lg={3}>
                  <Form.Check
                    type="checkbox"
                    id={`topic-${topic.id}`}
                    label={topic.name}
                    value={topic.id}
                    checked={formData.topic_ids.includes(topic.id)}
                    onChange={handleTopicChange}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Keywords</Form.Label>
          {loadingData ? (
            <Form.Control type="text" placeholder="Loading keywords..." disabled />
          ) : (
            <Row>
              {keywords.map((keyword) => (
                <Col key={keyword.id} xs={12} sm={6} md={4} lg={3}>
                  <Form.Check
                    type="checkbox"
                    id={`keyword-${keyword.id}`}
                    label={keyword.name}
                    value={keyword.id}
                    checked={formData.keyword_ids.includes(keyword.id)}
                    onChange={handleKeywordChange}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Form.Group>

        <Form.Group className="mb-4" style={{ width: '50%' }}>
          <Form.Check
            type="checkbox"
            label="Is Restricted"
            name="is_restricted"
            checked={formData.is_restricted}
            onChange={handleChange}
          />
        </Form.Group>

        <div className="text-left">
          <Button 
            variant="primary" 
            type="submit" 
            size="lg"
            disabled={loading || loadingData || 
              (fileUploadOption === 'upload' && !fileUploadSuccess) ||
              (fileUploadOption === 'path' && !formData.canonical_url)}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Submitting...
              </>
            ) : 'Submit Metadata'}
          </Button>
        </div><br/>
        {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Metadata submitted successfully!</Alert>}
      </Form>
    </Container>
  );
};

export default Metadata;