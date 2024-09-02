import React from "react";
import { Navbar, Nav, Button } from 'react-bootstrap'; // Import Navbar and Nav components
import { useNavigate } from "react-router-dom"; // For navigation


const KitchenNavBar = () => {
  const navigate = useNavigate();

  // Function to navigate to Stocks page
  const goToStocks = () => {
    navigate('/kitchenStocks'); // Replace with your stocks page route
  };

  // Function to navigate to Orders page
  const goToOrders = () => {
    navigate('/kitchenPage'); // Replace with your orders page route
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand>
      <i class="fa-solid fa-kitchen-set"></i> Kitchen Page
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Button variant="outline-light" className="mr-2" onClick={goToStocks}>
            Stocks
          </Button>
          <Button variant="outline-light" onClick={goToOrders}>
            Orders
          </Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default KitchenNavBar;