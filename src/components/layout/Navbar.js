// src/components/layout/Navbar.js
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavigationBar = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          HelpHands
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!isLoggedIn && (
              <Nav.Link as={Link} to="/">Home</Nav.Link>
            )}
            {isLoggedIn && (
              <>
                {user?.role === 'admin' ? (
                  // Admin navigation
                  <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                ) : (
                  // Volunteer navigation
                  <>
                    <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>
          
          <Nav>
            {isLoggedIn ? (
              <>
                <Navbar.Text className="me-3">
                  Welcome, {user?.name}! 
                  {user?.role === 'admin' && <span className="badge bg-warning text-dark ms-1">Admin</span>}
                </Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/">
                  <Button variant="outline-light" size="sm" className="me-2">
                    Login
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button variant="light" size="sm">
                    Register
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;