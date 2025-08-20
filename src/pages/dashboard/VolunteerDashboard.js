
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tab, Tabs, Spinner, Alert, Form, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { getEvents, joinEvent, leaveEvent, getMyAnnouncements, markAnnouncementAsRead } from '../../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';

const VolunteerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const eventsResponse = await getEvents();
      setEvents(eventsResponse);
      
      // Get user profile
      const token = localStorage.getItem('token');
      const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(profileResponse.data);
      
      // Get user's events
      const myEventsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/users/my-events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyEvents(myEventsResponse.data);
      
      // Get user's announcements
      const announcementsResponse = await getMyAnnouncements();
      setAnnouncements(announcementsResponse);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await joinEvent(eventId);
      toast.success('Successfully joined event!');
      fetchData();
    } catch (error) {
      toast.error('Failed to join event');
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      await leaveEvent(eventId);
      toast.success('Successfully left event!');
      fetchData();
    } catch (error) {
      toast.error('Failed to leave event');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/users/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const isJoined = (event) => {
    return event.volunteers.some(volunteer => volunteer._id === user.id);
  };

  const handleMarkAsRead = async (announcementId) => {
    try {
      await markAnnouncementAsRead(announcementId);
      // Update the announcement in state
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement._id === announcementId 
            ? { ...announcement, isRead: true }
            : announcement
        )
      );
    } catch (error) {
      toast.error('Failed to mark announcement as read');
    }
  };

  const isAnnouncementRead = (announcement) => {
    return announcement.read_by.some(read => read.user === user.id);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Welcome, {user?.name}! 🤝</h1>
      
      <Tabs defaultActiveKey="events" className="mb-4">
        {/* Available Events Tab */}
        <Tab eventKey="events" title="Available Events">
          <div className="mb-3">
            <h4>Volunteer Events</h4>
            <p className="text-muted">Browse and join volunteer events in your community.</p>
          </div>
          
          {events.length === 0 ? (
            <Alert variant="info">
              No events available at the moment. Check back later!
            </Alert>
          ) : (
            <Row>
              {events.map(event => (
                <Col md={6} lg={4} key={event._id} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>{event.title}</Card.Title>
                      <Card.Text>{event.description}</Card.Text>
                      <div className="mb-3">
                        <div className="text-muted small">
                          <div>📅 {new Date(event.date).toLocaleDateString()}</div>
                          <div>🕐 {event.time}</div>
                          <div>📍 {event.location}</div>
                          <div>👥 {event.volunteers.length}/{event.max_volunteers} volunteers</div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        {isJoined(event) ? (
                          <>
                            <Badge bg="success">Joined</Badge>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleLeaveEvent(event._id)}
                            >
                              Leave
                            </Button>
                          </>
                        ) : (
                          <Button 
                            variant="primary" 
                            disabled={event.volunteers.length >= event.max_volunteers}
                            onClick={() => handleJoinEvent(event._id)}
                            className="w-100"
                          >
                            {event.volunteers.length >= event.max_volunteers ? 'Event Full' : 'Join Event'}
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Tab>

        {/* Announcements Tab */}
        <Tab eventKey="announcements" title="Announcements">
          <div className="mb-3">
            <h4>My Announcements</h4>
            <p className="text-muted">Announcements from events you've joined.</p>
          </div>
          
          {announcements.length === 0 ? (
            <Alert variant="info">
              No announcements yet. Join events to receive announcements from organizers!
            </Alert>
          ) : (
            <Row>
              {announcements.map(announcement => {
                const isRead = isAnnouncementRead(announcement);
                return (
                  <Col md={12} key={announcement._id} className="mb-3">
                    <Card className={`${!isRead ? 'border-primary' : ''}`}>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <Card.Title className="h6 mb-0 me-2">
                                {announcement.title}
                              </Card.Title>
                              {!isRead && <Badge bg="primary">New</Badge>}
                            </div>
                            <Card.Text className="mb-2">
                              {announcement.message}
                            </Card.Text>
                            <div className="text-muted small">
                              <div>📅 Event: {announcement.event.title}</div>
                              <div>📍 {announcement.event.location}</div>
                              <div>📢 From: {announcement.created_by.name}</div>
                              <div>🕐 {new Date(announcement.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                          {!isRead && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleMarkAsRead(announcement._id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Tab>

        {/* Profile Tab */}
        <Tab eventKey="profile" title="Profile">
          <Row className="justify-content-center">
            <Col md={8}>
              <Card>
                <Card.Header>
                  <h5>Edit Profile</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleProfileUpdate}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={profile.email}
                        readOnly
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        value={profile.address}
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                      />
                    </Form.Group>
                    
                    <Button type="submit" disabled={updating}>
                      {updating ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </Form>
                  
                  {/* My Events Section */}
                  <hr className="my-4" />
                  <h6>My Events ({myEvents.length})</h6>
                  {myEvents.length === 0 ? (
                    <p className="text-muted">You haven't joined any events yet.</p>
                  ) : (
                    <div>
                      {myEvents.map(event => (
                        <div key={event._id} className="border rounded p-3 mb-2">
                          <h6 className="mb-1">{event.title}</h6>
                          <p className="small text-muted mb-0">
                            📅 {new Date(event.date).toLocaleDateString()} • 📍 {event.location}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default VolunteerDashboard;
