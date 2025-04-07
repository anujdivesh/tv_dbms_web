import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { PencilSquare } from 'react-bootstrap-icons';
import AuthService from "../services/auth.service";
import { get_url } from "./urls";

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  
  const [formData, setFormData] = useState({
    project_code: '',
    project_name: ''
  });

  useEffect(() => {
    const user = AuthService.getCurrentUserCookie();
    if (!user) {
      setUnauthorized(true);
      setLoading(false);
    } else {
      setToken(user.accessToken);
      setUnauthorized(false);
      fetchProjects(user.accessToken);
    }
  }, []);

  const fetchProjects = async (authToken) => {
    try {
      const response = await fetch(
         get_url('root-path')+"/ocean_api/api/projects",
        {
          headers: {
            'x-access-token': authToken
          }
        }
      );
      
      if (response.status === 401) {
        setUnauthorized(true);
        throw new Error('Unauthorized access');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
         get_url('root-path')+"/ocean_api/api/project/add", 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add project');
      }

      setShowModal(false);
      setFormData({
        project_code: '',
        project_name: ''
      });
      await fetchProjects(token);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (project) => {
    setCurrentEditItem(project);
    setFormData({
      project_code: project.project_code,
      project_name: project.project_name
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
         get_url('root-path')+`/ocean_api/api/project/${currentEditItem.id}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update project');
      }

      setShowEditModal(false);
      await fetchProjects(token);
    } catch (err) {
      setError(err.message);
    }
  };

  if (unauthorized) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">
          You need to be logged in to access this page. Please login first.
        </Alert>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center mt-4">Loading projects...</div>;
  }

  return (
    <div className="container mt-4">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Projects</h1>
        <Button 
          variant="primary"
          onClick={() => setShowModal(true)}
          disabled={!token}
        >
          Add Project
        </Button>
      </div>
      
      {projects.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Name</th>
              <th style={{ width: '80px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>{project.project_code}</td>
                <td>{project.project_name}</td>
                <td className="text-center" style={{ padding: '8px' }}>
                  <Button 
                    variant="link" 
                    onClick={() => handleEditClick(project)}
                    title="Edit"
                    style={{ padding: '0.25rem' }}
                  >
                    <PencilSquare className="text-primary" style={{ fontSize: '1.1rem' }} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="alert alert-info">No projects available</div>
      )}

      {/* Add Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Project</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Project Code *</Form.Label>
              <Form.Control
                type="text"
                name="project_code"
                value={formData.project_code}
                onChange={handleInputChange}
                required
                placeholder="Enter project code"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Project Name *</Form.Label>
              <Form.Control
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                required
                placeholder="Enter project name"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Project
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Project</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Project Code *</Form.Label>
              <Form.Control
                type="text"
                name="project_code"
                value={formData.project_code}
                onChange={handleInputChange}
                required
                placeholder="Enter project code"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Project Name *</Form.Label>
              <Form.Control
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                required
                placeholder="Enter project name"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Project
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Project;