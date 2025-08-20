import React, { useState } from 'react';
import { 
  Row, Col, Card, Button, Modal, Form, Alert, Spinner 
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';

const AnnouncementManagement = ({ events }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !message) {
      toast.error('Please select an event and enter a message');
      return;
    }

    // Check if event has volunteers
    const selectedEventData = events.find(e => e._id === selectedEvent);
    if (selectedEventData?.volunteers.length === 0) {
      const confirmSend = window.confirm('This event has no volunteers enrolled. Do you still want to send the announcement?');
      if (!confirmSend) {
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/events/${selectedEvent}/announce`,
        { message },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success(`Announcement sent to ${response.data.announcement.sentTo} volunteers!`);
      setShowModal(false);
      setSelectedEvent('');
      setMessage('');
    } catch (error) {
      console.error('Announcement error:', error);
      toast.error(error.response?.data?.message || 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4>Send Announcements</h4>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Send Announcement
            </Button>
          </div>
        </Col>
      </Row>

      {events.length === 0 ? (
        <Alert variant="info">
          No events available. Create events first to send announcements to volunteers.
        </Alert>
      ) : (
        <Row>
          {events.map(event => (
            <Col md={6} lg={4} key={event._id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{event.title}</Card.Title>
                  <Card.Text className="text-muted small">
                    📅 {new Date(event.date).toLocaleDateString()}<br/>
                    📍 {event.location}<br/>
                    👥 {event.volunteers.length} volunteers enrolled
                  </Card.Text>
                  <Button 
                    variant={event.volunteers.length === 0 ? "outline-warning" : "outline-primary"}
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(event._id);
                      setShowModal(true);
                    }}
                  >
                    {event.volunteers.length === 0 ? 'Send Announcement (No Volunteers)' : 'Send Announcement'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Announcement Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setSelectedEvent(''); setMessage(''); }}>
        <Modal.Header closeButton>
          <Modal.Title>Send Announcement</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSendAnnouncement}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Select Event</Form.Label>
              <Form.Select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                required
              >
                <option value="">Choose an event...</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Announcement Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Enter your announcement message..."
              />
            </Form.Group>

            {selectedEvent && (
              <Alert variant={events.find(e => e._id === selectedEvent)?.volunteers.length > 0 ? "info" : "warning"}>
                <small>
                  {events.find(e => e._id === selectedEvent)?.volunteers.length > 0 
                    ? `This announcement will be sent to ${events.find(e => e._id === selectedEvent)?.volunteers.length} volunteers enrolled in the selected event.`
                    : "This event has no volunteers enrolled yet. The announcement will be recorded but no one will receive it."
                  }
                </small>
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => { setShowModal(false); setSelectedEvent(''); setMessage(''); }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" className="me-2" /> : null}
              Send Announcement
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AnnouncementManagement;
