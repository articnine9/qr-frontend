import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCartItems,
  setSelectedIndex,
  resetSelectedIndex,
  updateCartItems,
} from "../../../SlicesFolder/Slices/kitchenSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import "./kitchen.css";
import KitchenNavBar from "../KitchenNavbar/kitchenNavbar";
import axios from "axios";

const KitchenPage = () => {
  const dispatch = useDispatch();
  const { selectedIndex, updatedItems, loading, error } = useSelector(
    (state) => state.cart
  );
  const [itemStatuses, setItemStatuses] = useState({
    all: [],
    few: [],
    none: [],
  });
  const [pendingUpdateIndex, setPendingUpdateIndex] = useState(null); 

  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      const response = await axios.get(
        "https://qr-backend-application.onrender.com/cart/items"
      );
      setCartItems(response.data);
    };

    fetchCartItems();
  }, []);


  useEffect(() => {
    const statuses = { all: [], few: [], none: [] };

    cartItems.forEach((item) => {
      const allFinished = item.items.every(
        (foodItem) => foodItem.status === "served"
      );
      const anyFinished = item.items.some(
        (foodItem) => foodItem.status === "served"
      );

      if (allFinished) statuses.all.push(item._id);
      else if (anyFinished) statuses.few.push(item._id);
      else statuses.none.push(item._id);
    });

    setItemStatuses(statuses);
  }, [cartItems]); 

 
  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  const handleFinishClickWrapper = (foodItemIndex) => {
    setPendingUpdateIndex(foodItemIndex); 
  };

  useEffect(() => {
    if (pendingUpdateIndex !== null && selectedIndex !== null) {
      const updated = updatedItems.map((item, index) =>
        index === pendingUpdateIndex ? { ...item, status: "served" } : item
      );

      const cartItemId = cartItems[selectedIndex]._id;
      const payload = { id: cartItemId, updatedItems: updated };

      dispatch(updateCartItems(payload))
        .unwrap()
        .then(() => {
          dispatch(fetchCartItems());
          setPendingUpdateIndex(null);
        })
        .catch((error) => {
          console.error("Failed to update cart:", error.message);
          setPendingUpdateIndex(null); 
        });
    }
  }, [pendingUpdateIndex, selectedIndex, updatedItems, cartItems, dispatch]);

  const handleCardClick = (index) => dispatch(setSelectedIndex(index));

  const handleBackToList = () => {
    dispatch(resetSelectedIndex());
  };

  const getCardClass = (itemId) => {
    if (itemStatuses.all.includes(itemId)) return "bg-success"; 
    if (itemStatuses.few.includes(itemId)) return "bg-warning";
    if (itemStatuses.none.includes(itemId)) return "bg-danger";
    return "";
  };

  const filteredCartItems = cartItems.filter(
    (item) =>
      !item.items.every((_, idx) => updatedItems[idx]?.status === "finished")
  );
  const selectedItem = selectedIndex !== null ? cartItems[selectedIndex] : null;

  if (loading) return <div className="text-center my-4">Loading...</div>;
  if (error)
    return <div className="text-center my-4 text-danger">Error: {error}</div>;

  return (
     <>
      <KitchenNavBar />
      <div className="container">
        <div className="box">
          <div className="flex-shrink-0" style={{ width: "45%" }}>
            <div className="row">
              {selectedItem === null ? (
                filteredCartItems.length > 0 ? (
                  filteredCartItems.map((item, index) => (
                    <div
                      key={index}
                      className="col-12 mb-4"
                      onClick={() => handleCardClick(index)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className={`card ${getCardClass(item._id)}`}>
                        <div className="card-body text-center">
                          <p
                            className="card-text"
                            style={{ fontSize: "1.25rem" }}
                          >
                            Table Number: {item.tableNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center">All items are finished.</div>
                )
              ) : (
                <div className="text-center">
                  <button
                    className="btn btn-primary mb-4"
                    onClick={handleBackToList}
                  >
                    Back to List
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="box">
          {selectedItem !== null && (
            <div className="flex-grow-1" style={{ width: "70%" }}>
              <div style={{ maxWidth: "800px", margin: "auto" }}>
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
                            <div
                              className={`card ${
                                foodItem.status === "served"
                                  ? "bg-success text-light"
                                  : "bg-danger text-white"
                              }`}
                            >
                              <div className="card-body">
                                <h5
                                  className="card-title"
                                  style={{ fontSize: "1.5rem" }}
                                >
                                  {foodItem.name}
                                </h5>
                                <p
                                  className="card-text"
                                  style={{ fontSize: "1.25rem" }}
                                >
                                  <strong>Count:</strong> {foodItem.count}
                                </p>
                                <p className="card-text">
                                  <strong>Status:</strong> {foodItem.status}
                                </p>
                                {foodItem.status !== "served" && (
                                  <button
                                    className="btn blinking-button"
                                    onClick={() =>
                                      handleFinishClickWrapper(idx)
                                    }
                                  >
                                    Mark as Served
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
      </div>
    </>
  );
};

export default KitchenPage;
