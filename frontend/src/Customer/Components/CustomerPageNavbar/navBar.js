import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from '../CustomerLogin/login'; // Import the Login component
import './navBar.css';
// import PhoneNumberLogin from '../PhoneNumberLogin/phoneNumberLogin';
import { useNavigate } from 'react-router-dom';

const MenuNavbar = () => {

  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false);

  // Function to handle modal show
  const handleShow = () => setShowModal(true);

  // Function to handle modal close
  const handleClose = () => setShowModal(false);

  const handleOrderStatus = () => {
    navigate('/orderStatus');
 };
 const handlePayBill = () => {
  navigate('/offlinePayment');
};

  return (
    <>
      <Navbar bg="body-tertiary" expand="lg" className="navbar-custom">
        <Container>
          <Navbar.Brand href="#home">🍔Food Order</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Button variant="outline-primary" onClick={handleShow}>
                Login
              </Button>
              <Button variant="outline-primary" onClick={handleOrderStatus}>
                 Check Order Status
              </Button>
              <Button variant="outline-primary" onClick={handlePayBill}>
                 Pay Bill
              </Button>

              
           
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Modal for login */}
      <Modal
        show={showModal}
        onHide={handleClose}
        centered
        size="md" // Adjust size as needed (sm, md, lg, xl)
        aria-labelledby="login-modal-title"
        className="custom-modal" // Apply custom styles
      >
        <Modal.Header closeButton>
          <Modal.Title id="login-modal-title">Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Login/>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MenuNavbar;
