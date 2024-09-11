import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedIndex, updateCartItems } from "../../../SlicesFolder/Slices/kitchenSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import "./kitchen.css";
import KitchenNavBar from "../KitchenNavbar/kitchenNavbar";
import axios from "axios";

const KitchenPage = () => {
  const dispatch = useDispatch();
  const { selectedIndex, loading, error } = useSelector((state) => state.cart);
  const [itemStatuses, setItemStatuses] = useState({
    all: [],
    few: [],
    none: [],
  });
  const [cartItems, setCartItems] = useState([]);
  const [pendingUpdate, setPendingUpdate] = useState(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get(
          "https://qr-backend-application.onrender.com/cart/items"
        );
        setCartItems(response.data);
      } catch (err) {
        console.error("Failed to fetch cart items:", err.message);
      }
    };

    fetchCartItems();
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      const statuses = { all: [], few: [], none: [] };

      cartItems.forEach((item) => {
        // Combine items and combos for status determination
        const allFoodItems = [...item.items, ...item.combos];
        const allFinished = allFoodItems.every(
          (foodItem) => foodItem.status === "served"
        );
        const anyFinished = allFoodItems.some(
          (foodItem) => foodItem.status === "served"
        );

        if (allFinished) statuses.all.push(item._id);
        else if (anyFinished) statuses.few.push(item._id);
        else statuses.none.push(item._id);
      });

      setItemStatuses(statuses);
    }
  }, [cartItems]);

  useEffect(() => {
    if (pendingUpdate !== null && selectedIndex !== null) {
      const { foodItemIndex, cartItemId, isCombo } = pendingUpdate;

      const cartItem = cartItems[selectedIndex];
      const updatedItems = cartItem[isCombo ? 'combos' : 'items'].map((item, index) =>
        index === foodItemIndex ? { ...item, status: "served" } : item
      );

      const payload = { id: cartItemId, updatedItems, isCombo };

      dispatch(updateCartItems(payload))
        .unwrap()
        .then(() => {
          axios
            .get("https://qr-backend-application.onrender.com/cart/items")
            .then((response) => {
              setCartItems(response.data);
            })
            .catch((err) => console.error("Failed to refetch cart items:", err.message));
          setPendingUpdate(null);
        })
        .catch((error) => {
          console.error("Failed to update cart:", error.message);
          setPendingUpdate(null);
        });
    }
  }, [pendingUpdate, selectedIndex, cartItems, dispatch]);

  const handleFinishClick = (foodItemIndex, isCombo = false) => {
    if (selectedIndex !== null) {
      const cartItemId = cartItems[selectedIndex]._id;
      setPendingUpdate({ foodItemIndex, cartItemId, isCombo });
    }
  };

  const handleCardClick = (index) => dispatch(setSelectedIndex(index));

  const getCardClass = (itemId) => {
    if (itemStatuses.all.includes(itemId)) return "bg-success";
    if (itemStatuses.few.includes(itemId)) return "bg-warning";
    if (itemStatuses.none.includes(itemId)) return "bg-danger";
    return "";
  };

  const filteredCartItems = cartItems;

  const selectedItem = selectedIndex !== null ? cartItems[selectedIndex] : null;

  if (loading) return <div className="text-center my-4">Loading...</div>;
  if (error)
    return <div className="text-center my-4 text-danger">Error: {error}</div>;

  return (
    <>
      <KitchenNavBar />
      <div className="containers">
        <div className="left-box">
          <span className="order-header">OrderList</span>
          <div className="orders-list">
            {filteredCartItems.length > 0 ? (
              filteredCartItems.map((item, index) => (
                <div
                  key={index}
                  className="order-box"
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
              <div className="text-center">No orders available</div>
            )}
          </div>
        </div>
        <div className="right-box">
          {selectedItem && (
            <div className="flex-grow-1" style={{ width: "70%" }}>
              <div style={{ maxWidth: "800px", margin: "auto" }}>
                <div className="card-body">
                  <p className="card-text">
                    <strong>Table Number:</strong> {selectedItem.tableNumber}
                  </p>
                  <div className="mb-4">
                    <h6>Ordered Food Items</h6>
                    {selectedItem.items.length > 0 || selectedItem.combos.length > 0 ? (
                      <div className="row">
                        {[...selectedItem.items, ...selectedItem.combos].map((foodItem, idx) => (
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
                                    onClick={() => handleFinishClick(idx, selectedItem.combos.includes(foodItem))}
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
