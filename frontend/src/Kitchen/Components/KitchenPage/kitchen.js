import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCartItems,
  setSelectedIndex,
  resetSelectedIndex,
  updateCartItems
} from "../../../SlicesFolder/Slices/kitchenSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import "./kitchen.css";
import KitchenNavBar from "../KitchenNavbar/kitchenNavbar";
import axios from 'axios';



const KitchenPage = () => {
  const dispatch = useDispatch();
  const {  selectedIndex, updatedItems, loading, error } = useSelector((state) => state.cart);
  const [itemStatuses, setItemStatuses] = useState({ all: [], few: [], none: [] });
  const [pendingUpdateIndex, setPendingUpdateIndex] = useState(null); // State for pending updates

  const[cartItems,setCartItems] = useState([])


 
  useEffect(() => {
    const fetchCartItems = async () => {
     
        const response = await axios.get('https://qr-backend-application.onrender.com/cart/items');
        setCartItems(response.data); // Store response data in state
       
       
        console.log('Cart items fetched:', response.data); // Log the response data
      } 
   
    fetchCartItems();
  }, []);
  
 

  // Update item statuses when cartItems change
  useEffect(() => {
    const statuses = { all: [], few: [], none: [] };

    cartItems.forEach(item => {
      const allFinished = item.items.every(foodItem => foodItem.status === 'finished');
      const anyFinished = item.items.some(foodItem => foodItem.status === 'finished');

      if (allFinished) statuses.all.push(item._id);
      else if (anyFinished) statuses.few.push(item._id);
      else statuses.none.push(item._id);
    });

    setItemStatuses(statuses);
  }, [cartItems]); // Recalculate statuses when cartItems changes

  // Fetch cart items on component mount
  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  // Effect to handle immediate UI update when a food item is marked as finished
  useEffect(() => {
    if (pendingUpdateIndex !== null && selectedIndex !== null) {
      const updated = updatedItems.map((item, index) =>
        index === pendingUpdateIndex ? { ...item, status: 'finished' } : item
      );

      const cartItemId = cartItems[selectedIndex]._id;
      const payload = { id: cartItemId, updatedItems: updated };

      dispatch(updateCartItems(payload))
        .unwrap()
        .then(() => {
          dispatch(fetchCartItems()); // Refresh the cart items after updating
          setPendingUpdateIndex(null); // Reset pending update index
        })
        .catch((error) => {
          console.error('Failed to update cart:', error.response ? error.response.data : error.message);
          setPendingUpdateIndex(null); // Reset pending update index even if there's an error
        });
    }
  }, [pendingUpdateIndex, selectedIndex, updatedItems, cartItems, dispatch]);

  const handleCardClick = (index) => dispatch(setSelectedIndex(index));

  const handleFinishClickWrapper = (foodItemIndex) => {
    setPendingUpdateIndex(foodItemIndex); // Set the index for the item to be updated
    window.location.reload();
  };

  const handleBackToList = () => {
    dispatch(resetSelectedIndex());
  };

  const getCardClass = (itemId) => {
    if (itemStatuses.all.includes(itemId)) return "bg-success"; // Hide card if all items are finished
    if (itemStatuses.few.includes(itemId)) return "bg-warning";
    if (itemStatuses.none.includes(itemId)) return "bg-danger";
    return "";
  };

  const filteredCartItems = cartItems.filter(item => !item.items.every((_, idx) => updatedItems[idx]?.status === "finished"));
  const selectedItem = selectedIndex !== null ? cartItems[selectedIndex] : null;

  if (loading) return <div className="text-center my-4">Loading...</div>;
  if (error) return <div className="text-center my-4 text-danger">Error: {error}</div>;

  return (
    <>
      <KitchenNavBar />
      <div className="container" style={{ padding: "20px" }}>
        {selectedItem === null ? (
          <div className="row">
            {filteredCartItems.length > 0 ? (
              filteredCartItems.map((item, index) => (
                <div
                  key={index}
                  className="col-md-4 mb-4"
                  onClick={() => handleCardClick(index)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={`card ${getCardClass(item._id)}`}>
                    <div className="card-body text-center">
                      <p className="card-text" style={{ fontSize: "1.25rem" }}>
                        Table Number: {item.tableNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center">All items are finished.</div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <button className="btn btn-primary mb-4" onClick={handleBackToList}>
              Back to List
            </button>
            <div style={{ maxWidth: "800px" }}>
              <div className="card-body">
                <p className="card-text">
                  <strong>Table Number:</strong> {selectedItem.tableNumber}
                </p>
                <div className="mb-4">
                  <h6>Ordered Food Items</h6>
                  {updatedItems.length > 0 ? (
                    <div className="row">
                      {updatedItems.map((foodItem, idx) => (
                        <div key={idx} className="col-md-4 mb-4">
                          <div className={`card ${foodItem.status === "finished" ? "bg-success text-light" : "bg-danger text-white"}`}>
                            <div className="card-body">
                              <h5 className="card-title" style={{ fontSize: "1.5rem" }}>
                                {foodItem.name}
                              </h5>
                              <p className="card-text" style={{ fontSize: "1.25rem" }}>
                                <strong>Count:</strong> {foodItem.count}
                              </p>
                              <p className="card-text">
                                <strong>Status:</strong> {foodItem.status}
                              </p>
                              {foodItem.status !== "finished" && (
                                <button
                                  className="btn blinking-button"
                                  onClick={() => handleFinishClickWrapper(idx)}
                                >
                                  Mark as Finished
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No food items available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default KitchenPage;






