import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { PencilSquare } from 'react-bootstrap-icons';
import AuthService from "../services/auth.service";
import { get_url } from "./urls";
const Data_Type = () => {
  const [dataTypes, setDataTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  
  const [formData, setFormData] = useState({
    datatype_code: '',
    datatype_name: ''
  });

  useEffect(() => {
    const user = AuthService.getCurrentUserCookie();
    if (!user) {
      setUnauthorized(true);
      setLoading(false);
    } else {
      setToken(user.accessToken);
      setUnauthorized(false);
      fetchDataTypes(user.accessToken);
    }
  }, []);

  const fetchDataTypes = async (authToken) => {
    try {
      const response = await fetch(
         get_url('root-path')+"/ocean_api/api/data_type",
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
      setDataTypes(data);
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
         get_url('root-path')+"/ocean_api/api/data_type/add", 
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
        throw new Error(errorData.message || 'Failed to add data type');
      }

      setShowModal(false);
      setFormData({
        datatype_code: '',
        datatype_name: ''
      });
      await fetchDataTypes(token);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (dataType) => {
    setCurrentEditItem(dataType);
    setFormData({
      datatype_code: dataType.datatype_code,
      datatype_name: dataType.datatype_name
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
         get_url('root-path')+`/ocean_api/api/data_type/${currentEditItem.id}`, 
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
        throw new Error(errorData.message || 'Failed to update data type');
      }

      setShowEditModal(false);
      await fetchDataTypes(token);
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
    return <div className="text-center mt-4">Loading data types...</div>;
  }

  return (
    <div className="container mt-4">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Data Types</h1>
        <Button 
          variant="primary"
          onClick={() => setShowModal(true)}
          disabled={!token}
        >
          Add Data Type
        </Button>
      </div>
      
      {dataTypes.length > 0 ? (
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
           {dataTypes.map((dataType) => (
             <tr key={dataType.id}><td>{dataType.id}</td><td>{dataType.datatype_code}</td><td>{dataType.datatype_name}</td><td className="text-center" style={{ padding: '8px' }}><Button variant="link" onClick={() => handleEditClick(dataType)} title="Edit" style={{ padding: '0.25rem' }}><PencilSquare className="text-primary" style={{ fontSize: '1.1rem' }} /></Button></td></tr>
           ))}
         </tbody>
       </Table>
      ) : (
        <div className="alert alert-info">No data types available</div>
      )}

      {/* Add Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Data Type</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Data Type Code *</Form.Label>
              <Form.Control
                type="text"
                name="datatype_code"
                value={formData.datatype_code}
                onChange={handleInputChange}
                required
                placeholder="Enter data type code"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Data Type Name *</Form.Label>
              <Form.Control
                type="text"
                name="datatype_name"
                value={formData.datatype_name}
                onChange={handleInputChange}
                required
                placeholder="Enter data type name"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Data Type
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Data Type</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Data Type Code *</Form.Label>
              <Form.Control
                type="text"
                name="datatype_code"
                value={formData.datatype_code}
                onChange={handleInputChange}
                required
                placeholder="Enter data type code"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Data Type Name *</Form.Label>
              <Form.Control
                type="text"
                name="datatype_name"
                value={formData.datatype_name}
                onChange={handleInputChange}
                required
                placeholder="Enter data type name"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Data Type
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Data_Type;