import React, { useState } from 'react';
import { 
  Row, Col, Card, Button, Modal, Form, Table, Badge, Alert, Spinner, Accordion 
} from 'react-bootstrap';
import { 
  createEvent, updateEvent, deleteEvent, removeVolunteerFromEvent
} from '../../services/api';
import { toast } from 'react-toastify';

const EventManagement = ({ events, onEventsUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    max_volunteers: ''
  });

  const categories = ['Environment', 'Education', 'Health', 'Community', 'Animals', 'Elderly', 'General'];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      max_volunteers: ''
    });
    setEditingEvent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingEvent) {
        await updateEvent(editingEvent._id, formData);
        toast.success('Event updated successfully!');
      } else {
        await createEvent(formData);
        toast.success('Event created successfully!');
      }
      
      setShowModal(false);
      resetForm();
      onEventsUpdate();
    } catch (error) {
      console.error('Event operation error:', error);
      const errorMessage = error.message || error.response?.data?.message || error.response?.data?.errors?.join(', ') || 'Operation failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    // Format date properly for date input
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toISOString().slice(0, 10); // YYYY-MM-DD format
    
    setFormData({
      title: event.title,
      description: event.description,
      date: formattedDate,
      time: event.time || '',
      location: event.location,
      max_volunteers: event.max_volunteers
    });
    setShowModal(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
        toast.success('Event deleted successfully!');
        onEventsUpdate();
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  const handleRemoveVolunteer = async (eventId, volunteerId, volunteerName) => {
    if (window.confirm(`Remove ${volunteerName} from this event?`)) {
      try {
        await removeVolunteerFromEvent(eventId, volunteerId);
        toast.success(`${volunteerName} removed from event`);
        onEventsUpdate();
      } catch (error) {
        toast.error('Failed to remove volunteer');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4>Event Management</h4>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + Create New Event
            </Button>
          </div>
        </Col>
      </Row>

      {events.length === 0 ? (
        <Alert variant="info">
          No events created yet. Click "Create New Event" to get started!
        </Alert>
      ) : (
        <Accordion>
          {events.map((event, index) => (
            <Accordion.Item eventKey={index.toString()} key={event._id}>
              <Accordion.Header>
                <div className="d-flex justify-content-between w-100 me-3">
                  <div>
                    <strong>{event.title}</strong>
                    <div className="text-muted small">
                      {formatDate(event.date)} • {event.location}
                    </div>
                  </div>
                  <div>
                    <Badge bg={event.volunteers.length >= event.max_volunteers ? 'danger' : 'success'}>
                      {event.volunteers.length}/{event.max_volunteers}
                    </Badge>
                    <Badge bg="secondary" className="ms-2">{event.category}</Badge>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={8}>
                    <h6>Description</h6>
                    <p>{event.description}</p>
                    
                    <h6>Registered Volunteers ({event.volunteers.length})</h6>
                    {event.volunteers.length === 0 ? (
                      <p className="text-muted">No volunteers registered yet.</p>
                    ) : (
                      <div className="table-responsive">
                        <Table striped bordered hover size="sm">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {event.volunteers.map(volunteer => (
                              <tr key={volunteer._id}>
                                <td>{volunteer.name}</td>
                                <td>{volunteer.email}</td>
                                <td>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleRemoveVolunteer(event._id, volunteer._id, volunteer.name)}
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}

                  </Col>
                  
                  <Col md={4}>
                    <Card>
                      <Card.Header>
                        <h6>Event Actions</h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-grid gap-2">
                          <Button variant="outline-primary" onClick={() => handleEdit(event)}>
                            Edit Event
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            onClick={() => handleDelete(event._id)}
                          >
                            Delete Event
                          </Button>
                        </div>
                        
                        <div className="mt-3">
                          <small className="text-muted">
                            Created: {new Date(event.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      {/* Event Create/Edit Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }}>
        <Modal.Header closeButton>
          <Modal.Title>{editingEvent ? 'Edit Event' : 'Create New Event'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Event Title *</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                placeholder="Enter event title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                placeholder="Describe the event..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Time *</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Volunteers *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.max_volunteers}
                    onChange={(e) => setFormData({...formData, max_volunteers: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                    placeholder="Event location"
                  />
                </Form.Group>
              </Col>
            </Row>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" className="me-2" /> : null}
              {editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </>
  );
};

export default EventManagement;
