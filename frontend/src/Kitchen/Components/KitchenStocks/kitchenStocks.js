import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import axios from 'axios';
import KitchenNavBar from "../KitchenNavbar/kitchenNavbar";
import { Card, Row, Col } from 'react-bootstrap';
import { setFoodItemImages } from "../../../SlicesFolder/Slices/menuSlice";
import './kitchenStocks.css';

const KitchenStocks = () => {
  const dispatch = useDispatch();
  const [foodItems, setFoodItems] = useState([]);

  // Memoized fetchFoodItemsImages using useCallback
  const fetchFoodItemsImages = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3500/menu/stocks');
      const foodItemsData = response.data;
      const urls = foodItemsData.map(item => ({
        typeName: item.name,
        typeImageUrl: `http://localhost:3500/files/image/${item.imageId}`,
        typePrice: item.price,
        categoryName: item.categoryName,
        typeId: item._id,
        type: item.type,
        availability: item.availability
      }));
      dispatch(setFoodItemImages(urls));
      setFoodItems(urls);
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchFoodItemsImages();
  }, [fetchFoodItemsImages]); // Included fetchFoodItemsImages in the dependency array

  const updateAvailability = async (typeId, newStatus) => {
    try {
      await axios.patch(`http://localhost:3500/menu/stocks/${typeId}`, { availability: newStatus });
      setFoodItems(foodItems.map(item =>
        item.typeId === typeId ? { ...item, availability: newStatus } : item
      ));
      console.log(`Food item ${typeId} updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleToggleChange = (typeId, currentAvailability) => {
    const newStatus = currentAvailability === 'available' ? 'not available' : 'available';
    updateAvailability(typeId, newStatus);
  };

  return (
    <>
      <KitchenNavBar />
      <h2>Stock Page</h2>
      <div className="food-items-container">
        {foodItems.length > 0 ? (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {foodItems.map((item, index) => (
              <Col key={index} className="d-flex align-items-stretch">
                <Card
                  className="food-item-card"
                  style={{
                    backgroundColor: item.availability === 'available' ? '#d4edda' : '#f8d7da',
                  }}
                >
                  <Card.Img
                    variant="top"
                    src={item.typeImageUrl}
                    className="food-item-image"
                    style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title>{item.typeName}</Card.Title>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={item.availability === 'available'}
                        onChange={() => handleToggleChange(item.typeId, item.availability)}
                      />
                      <span className="slider"></span>
                    </label>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p>No food items available.</p>
        )}
      </div>
    </>
  );
};

export default KitchenStocks;
