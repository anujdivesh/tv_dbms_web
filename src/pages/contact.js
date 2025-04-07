import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import AuthService from "../services/auth.service";
import { get_url } from "./urls";

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    position: '',
    email: ''
  });

  useEffect(() => {
    const user = AuthService.getCurrentUserCookie();
    if (!user) {
      setUnauthorized(true);
      setLoading(false);
    } else {
      setToken(user.accessToken);
      setUnauthorized(false);
      fetchContacts(user.accessToken);
    }
  }, []);

  const fetchContacts = async (authToken) => {
    try {
      const response = await fetch(
        get_url('root-path')+"/ocean_api/api/contacts",
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
      setContacts(data);
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
         get_url('root-path')+"/ocean_api/api/contact/add", 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.status === 401) {
        setUnauthorized(true);
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add contact');
      }

      setShowModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        position: '',
        email: ''
      });
      await fetchContacts(token);
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
    return <div className="text-center mt-4">Loading contacts...</div>;
  }

  return (
    <div className="container mt-4">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Contacts</h1>
        <Button 
          variant="primary"
          onClick={() => setShowModal(true)}
          disabled={!token}
        >
          Add Contact
        </Button>
      </div>
      
      {contacts.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Position</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id || contact.email}>
                <td>{contact.id}</td>
                <td>{contact.first_name}</td>
                <td>{contact.last_name || '-'}</td>
                <td>{contact.position || '-'}</td>
                <td>{contact.email}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="alert alert-info">No contacts available</div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Contact</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>First Name *</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Position</Form.Label>
              <Form.Control
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Contact
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Contact;