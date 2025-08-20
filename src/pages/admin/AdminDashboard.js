import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tab, Tabs, Badge, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { getEvents } from '../../services/api';
import EventManagement from './EventManagement';
import AnnouncementManagement from './AnnouncementManagement';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  // const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getDashboardStats = () => {
    const totalEvents = events.length;
    const totalVolunteers = events.reduce((total, event) => total + event.volunteers.length, 0);

    return {
      totalEvents,
      totalVolunteers
    };
  };

  const stats = getDashboardStats();

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3 mb-3">Admin Dashboard</h1>
          <p className="text-muted">Welcome back, {user?.name}! Manage your volunteer events and announcements.</p>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="overview" title="Overview">
          <Row className="justify-content-center">
            <Col lg={4} md={6} className="mb-4">
              <Card className="bg-primary text-white h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <Card.Title className="h4">{stats.totalEvents}</Card.Title>
                      <Card.Text>Total Events</Card.Text>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-calendar-alt fa-2x"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} md={6} className="mb-4">
              <Card className="bg-info text-white h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <Card.Title className="h4">{stats.totalVolunteers}</Card.Title>
                      <Card.Text>Total Registrations</Card.Text>
                    </div>
                    <div className="align-self-center">
                      <i className="fas fa-users fa-2x"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={10}>
              <Card>
                <Card.Header>
                  <h5>Recent Events</h5>
                </Card.Header>
                <Card.Body>
                  {events.length === 0 ? (
                    <Alert variant="info">No events created yet. Go to Event Management tab to create your first event!</Alert>
                  ) : (
                    <div>
                      {events.slice(0, 5).map(event => (
                        <div key={event._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <div>
                            <strong>{event.title}</strong>
                            <div className="text-muted small">
                              {new Date(event.date).toLocaleDateString()} • {event.location}
                            </div>
                          </div>
                          <div className="text-end">
                            <Badge bg={event.volunteers.length >= event.max_volunteers ? 'danger' : 'success'}>
                              {event.volunteers.length}/{event.max_volunteers} volunteers
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {events.length > 5 && (
                        <div className="text-center mt-3">
                          <Button 
                            variant="outline-primary" 
                            onClick={() => setActiveTab('events')}
                          >
                            View All Events
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="events" title="Event Management">
          <EventManagement 
            events={events} 
            onEventsUpdate={loadDashboardData} 
          />
        </Tab>

        <Tab eventKey="announcements" title="Announcements">
          <AnnouncementManagement events={events} />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminDashboard;
