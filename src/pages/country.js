import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { PencilSquare } from 'react-bootstrap-icons';
import AuthService from "../services/auth.service";
import { get_url } from "./urls";

const Country = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  
  const [formData, setFormData] = useState({
    short_name: '',
    long_name: '',
    west_bound_longitude: '',
    east_bound_longitude: '',
    south_bound_latitude: '',
    north_bound_latitude: '',
    crs: ''
  });

  useEffect(() => {
    const user = AuthService.getCurrentUserCookie();
    if (!user) {
      setUnauthorized(true);
      setLoading(false);
    } else {
      setToken(user.accessToken);
      setUnauthorized(false);
      fetchCountries(user.accessToken);
    }
  }, []);

  const fetchCountries = async (authToken) => {
    try {
      const response = await fetch(
         get_url('root-path')+"/ocean_api/api/countries",
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
      setCountries(data);
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
         get_url('root-path')+"/ocean_api/api/country/add", 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify({
            ...formData,
            west_bound_longitude: formData.west_bound_longitude || null,
            east_bound_longitude: formData.east_bound_longitude || null,
            south_bound_latitude: formData.south_bound_latitude || null,
            north_bound_latitude: formData.north_bound_latitude || null,
            crs: formData.crs || null
          })
        }
      );

      if (response.status === 401) {
        setUnauthorized(true);
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add country');
      }

      setShowModal(false);
      setFormData({
        short_name: '',
        long_name: '',
        west_bound_longitude: '',
        east_bound_longitude: '',
        south_bound_latitude: '',
        north_bound_latitude: '',
        crs: ''
      });
      await fetchCountries(token);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (country) => {
    setCurrentEditItem(country);
    setFormData({
      short_name: country.short_name,
      long_name: country.long_name,
      west_bound_longitude: country.west_bound_longitude || '',
      east_bound_longitude: country.east_bound_longitude || '',
      south_bound_latitude: country.south_bound_latitude || '',
      north_bound_latitude: country.north_bound_latitude || '',
      crs: country.crs || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
         get_url('root-path')+`/ocean_api/api/country/${currentEditItem.short_name}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify({
            ...formData,
            west_bound_longitude: formData.west_bound_longitude || null,
            east_bound_longitude: formData.east_bound_longitude || null,
            south_bound_latitude: formData.south_bound_latitude || null,
            north_bound_latitude: formData.north_bound_latitude || null,
            crs: formData.crs || null
          })
        }
      );

      if (response.status === 401) {
        setUnauthorized(true);
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update country');
      }

      setShowEditModal(false);
      await fetchCountries(token);
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
    return <div className="text-center mt-4">Loading countries...</div>;
  }

  return (
    <div className="container mt-4">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Countries</h1>
        <Button 
          variant="primary"
          onClick={() => setShowModal(true)}
          disabled={!token}
        >
          Add Country
        </Button>
      </div>
      
      {countries.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Short Name</th>
              <th>Long Name</th>
              <th>West Bound</th>
              <th>East Bound</th>
              <th>South Bound</th>
              <th>North Bound</th>
              <th>CRS</th>
              <th style={{ width: '80px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((country) => (
              <tr key={`${country.short_name}-${country.long_name}`}>
                <td>{country.short_name}</td>
                <td>{country.long_name}</td>
                <td>{country.west_bound_longitude || '-'}</td>
                <td>{country.east_bound_longitude || '-'}</td>
                <td>{country.south_bound_latitude || '-'}</td>
                <td>{country.north_bound_latitude || '-'}</td>
                <td>{country.crs || '-'}</td>
                <td className="text-center" style={{ padding: '8px' }}>
                  <Button 
                    variant="link" 
                    onClick={() => handleEditClick(country)}
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
        <div className="alert alert-info">No countries available</div>
      )}

      {/* Add Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Country</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Short Name *</Form.Label>
              <Form.Control
                type="text"
                name="short_name"
                value={formData.short_name}
                onChange={handleInputChange}
                required
                maxLength="2"
                placeholder="2-letter country code (e.g., TV)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Long Name *</Form.Label>
              <Form.Control
                type="text"
                name="long_name"
                value={formData.long_name}
                onChange={handleInputChange}
                required
                placeholder="Full country name (e.g., Tuvalu)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>West Bound Longitude</Form.Label>
              <Form.Control
                type="number"
                name="west_bound_longitude"
                value={formData.west_bound_longitude}
                onChange={handleInputChange}
                placeholder="Decimal degrees (-180 to 180)"
                step="0.000001"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>East Bound Longitude</Form.Label>
              <Form.Control
                type="number"
                name="east_bound_longitude"
                value={formData.east_bound_longitude}
                onChange={handleInputChange}
                placeholder="Decimal degrees (-180 to 180)"
                step="0.000001"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>South Bound Latitude</Form.Label>
              <Form.Control
                type="number"
                name="south_bound_latitude"
                value={formData.south_bound_latitude}
                onChange={handleInputChange}
                placeholder="Decimal degrees (-90 to 90)"
                step="0.000001"
                min="-90"
                max="90"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>North Bound Latitude</Form.Label>
              <Form.Control
                type="number"
                name="north_bound_latitude"
                value={formData.north_bound_latitude}
                onChange={handleInputChange}
                placeholder="Decimal degrees (-90 to 90)"
                step="0.000001"
                min="-90"
                max="90"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Coordinate Reference System (CRS)</Form.Label>
              <Form.Control
                type="text"
                name="crs"
                value={formData.crs}
                onChange={handleInputChange}
                placeholder="EPSG code (e.g., EPSG:4326)"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Country
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Country</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Short Name *</Form.Label>
              <Form.Control
                type="text"
                name="short_name"
                value={formData.short_name}
                onChange={handleInputChange}
                required
                maxLength="2"
                placeholder="2-letter country code (e.g., TV)"
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Long Name *</Form.Label>
              <Form.Control
                type="text"
                name="long_name"
                value={formData.long_name}
                onChange={handleInputChange}
                required
                placeholder="Full country name (e.g., Tuvalu)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>West Bound Longitude</Form.Label>
              <Form.Control
                type="number"
                name="west_bound_longitude"
                value={formData.west_bound_longitude}
                onChange={handleInputChange}
                placeholder="Decimal degrees (-180 to 180)"
                step="0.000001"
                min="-180"
                max="180"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>East Bound Longitude</Form.Label>
              <Form.Control
                type="number"
                name="east_bound_longitude"
                value={formData.east_bound_longitude}
                onChange={handleInputChange}
                placeholder="Decimal degrees (-180 to 180)"
                step="0.000001"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>South Bound Latitude</Form.Label>
              <Form.Control
                type="number"
                name="south_bound_latitude"
                value={formData.south_bound_latitude}
                onChange={handleInputChange}
                placeholder="Decimal degrees (-90 to 90)"
                step="0.000001"
                min="-90"
                max="90"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>North Bound Latitude</Form.Label>
              <Form.Control
                type="number"
                name="north_bound_latitude"
                value={formData.north_bound_latitude}
                onChange={handleInputChange}
                placeholder="Decimal degrees (-90 to 90)"
                step="0.000001"
                min="-90"
                max="90"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Coordinate Reference System (CRS)</Form.Label>
              <Form.Control
                type="text"
                name="crs"
                value={formData.crs}
                onChange={handleInputChange}
                placeholder="EPSG code (e.g., EPSG:4326)"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Country
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Country;