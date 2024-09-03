import React, { useEffect, useState } from "react";
import axios from "axios";
import "./orderStatus.css"; // Ensure this file includes the necessary CSS

const OrderStatus = () => {
  const [currentTableOrders, setCurrentTableOrders] = useState([]);
  const [allItemsFromFiltered, setAllItemsFromFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentTableNumber = localStorage.getItem("currentTableNumber");

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://qr-backend-application.onrender.com/cart/items"
        );
        const cartItems = response.data;

        console.log("cartItems", cartItems);

        if (cartItems.length > 0 && currentTableNumber) {
          // Filter cart items based on currentTableNumber
          const filteredItems = cartItems.filter(
            (item) => item.tableNumber === parseInt(currentTableNumber)
          );

          // Extract items from each filtered item
          const itemsFromFiltered = filteredItems.flatMap((item) => item.items);

          // Set the state for current table orders if needed
          if (filteredItems.length > 0) {
            setCurrentTableOrders(filteredItems[0].items);
          } else {
            setCurrentTableOrders([]);
          }

          // Store the extracted items in state
          setAllItemsFromFiltered(itemsFromFiltered);
        } else {
          setCurrentTableOrders([]);
          setAllItemsFromFiltered([]);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [currentTableNumber]);

  if (loading) {
    return <div className="text-center my-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center my-4 text-danger">Error: {error}</div>;
  }

  return (
    <>
      <h1>Order Status</h1>
      <div className="container">
        {currentTableOrders.length > 0 ? (
          <div className="row">
            {allItemsFromFiltered.length > 0 ? (
              allItemsFromFiltered.map((foodItem, index) => (
                <div key={index} className="col-md-4 mb-4">
                  <div
                    className={`card ${
                      foodItem.status === "finished"
                        ? "bg-success text-light"
                        : "bg-danger text-light"
                    }`}
                  >
                    <div className="card-body">
                      <h5 className="card-title">{foodItem.name}</h5>
                      <p className="card-text">
                        <strong>Count:</strong> {foodItem.count}
                      </p>
                      <p className="card-text">
                        <strong>Status:</strong> {foodItem.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No updated food items available</p>
            )}
          </div>
        ) : (
          <p>No orders for the current table</p>
        )}
      </div>
    </>
  );
};

export default OrderStatus;
