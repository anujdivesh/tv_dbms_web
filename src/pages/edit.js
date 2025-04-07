import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import AuthService from "../services/auth.service";
import { get_url } from './urls';
import { useNavigate } from 'react-router-dom';

const MetadataList = () => {
  const [metadataList, setMetadataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [metadataToDelete, setMetadataToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  // Fetch metadata list
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const token = AuthService.getCurrentUserCookie()?.accessToken;
        if (!token) throw new Error('Authentication required');

        const response = await fetch(get_url('root-path') + '/ocean_api/api/metadata', {
          headers: { 'x-access-token': token }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch metadata');
        }

        const data = await response.json();
        setMetadataList(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  // Handle delete confirmation
  const handleDeleteClick = (metadata) => {
    setMetadataToDelete(metadata);
    setShowDeleteModal(true);
  };

  // Handle actual deletion
  const handleConfirmDelete = async () => {
    if (!metadataToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const token = AuthService.getCurrentUserCookie()?.accessToken;
      if (!token) throw new Error('Authentication required');

      const response = await fetch(get_url('root-path') + `/ocean_api/api/metadata/${metadataToDelete.id}`, {
        method: 'DELETE',
        headers: { 'x-access-token': token }
      });

      if (!response.ok) {
        throw new Error('Failed to delete metadata');
      }

      // Remove the deleted item from the list
      setMetadataList(prev => prev.filter(item => item.id !== metadataToDelete.id));
      setSuccessMessage(`Metadata "${metadataToDelete.title}" deleted successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setMetadataToDelete(null);
    }
  };

  // Handle edit navigation
  const handleEditClick = (id) => {
    navigate(`/metadata/edit/${id}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Close delete modal
  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setMetadataToDelete(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="mt-3">Error: {error}</Alert>;
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Metadata Records</h2>
      
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {deleteError && <Alert variant="danger">{deleteError}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Data Type</th>
            <th>Project</th>
            <th>Temporal Coverage</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {metadataList.length > 0 ? (
            metadataList.map((metadata) => (
              <tr key={metadata.id}>
                <td>{metadata.title}</td>
                <td>{metadata.data_type?.datatype_name || 'N/A'}</td>
                <td>{metadata.project?.project_name || 'N/A'}</td>
                <td>
                  {formatDate(metadata.temporal_coverage_from)} - {formatDate(metadata.temporal_coverage_to)}
                </td>
                <td>{formatDate(metadata.createdAt)}</td>
                <td>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDeleteClick(metadata)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">No metadata records found</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the metadata record "{metadataToDelete?.title}"?
          <br />
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MetadataList;