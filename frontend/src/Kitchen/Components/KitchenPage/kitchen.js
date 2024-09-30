import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedIndex,
  updateCartItems,
  fetchCartItems,
} from "../../../SlicesFolder/Slices/kitchenSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import "./kitchen.css";
import KitchenNavBar from "../KitchenNavbar/kitchenNavbar";

const KitchenPage = () => {
  const dispatch = useDispatch();
  const { selectedIndex, loading, error, cartItems } = useSelector(
    (state) => state.cart
  );
  const [itemStatuses, setItemStatuses] = useState({
    all: [],
    few: [],
    none: [],
  });
  const [pendingUpdate, setPendingUpdate] = useState(null);

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  useEffect(() => {
    if (cartItems.length > 0) {
      const statuses = { all: [], few: [], none: [] };

      cartItems.forEach((item) => {
        const allFoodItems = [...item.items, ...item.combos];
        const allFinished = allFoodItems.every(
          (foodItem) => foodItem.status === "Served"
        );
        const anyFinished = allFoodItems.some(
          (foodItem) => foodItem.status === "Served"
        );

        if (allFinished) statuses.all.push(item._id);
        else if (anyFinished) statuses.few.push(item._id);
        else statuses.none.push(item._id);
      });

      setItemStatuses(statuses);
    }
  }, [cartItems]);

  const handleFinishClick = (foodItemIndex, isCombo = false) => {
    if (selectedIndex !== null) {
      const cartItemId = cartItems[selectedIndex]._id;
      const selectedItem = cartItems[selectedIndex];
      const foodItem = isCombo
        ? selectedItem.combos[foodItemIndex]
        : selectedItem.items[foodItemIndex];

      if (foodItem) {
        setPendingUpdate({ foodItemIndex, cartItemId, isCombo });
      } else {
        console.error("Food item not found at index", foodItemIndex);
      }
    } else {
      console.error("No selected index available.");
    }
  };

  useEffect(() => {
    if (pendingUpdate !== null && selectedIndex !== null) {
      const { foodItemIndex, cartItemId, isCombo } = pendingUpdate;
      const cartItem = cartItems[selectedIndex];

      const updatedItems = [...cartItem.items];
      const updatedCombos = [...cartItem.combos];

      if (isCombo) {
        if (foodItemIndex >= 0 && foodItemIndex < updatedCombos.length) {
          updatedCombos[foodItemIndex] = {
            ...updatedCombos[foodItemIndex],
            status: "Served",
          };
        } else {
          console.error("Combo index out of bounds:", foodItemIndex);
          return;
        }
      } else {
        if (foodItemIndex >= 0 && foodItemIndex < updatedItems.length) {
          updatedItems[foodItemIndex] = {
            ...updatedItems[foodItemIndex],
            status: "Served",
          };
        } else {
          console.error("Item index out of bounds:", foodItemIndex);
          return;
        }
      }

      const payload = {
        id: cartItemId,
        updatedItems: isCombo ? [] : updatedItems,
        updatedCombos: isCombo ? updatedCombos : [],
      };

      console.log("payload", payload);

      dispatch(updateCartItems(payload))
        .unwrap()
        .then(() => {
          setPendingUpdate(null); // Reset pending update
        })
        .catch((error) => {
          console.error("Failed to update cart:", error.message);
          setPendingUpdate(null); // Reset pending update
        });
    }
  }, [pendingUpdate, selectedIndex, cartItems, dispatch]);

  const handleCardClick = (index) => dispatch(setSelectedIndex(index));

  const getCardClass = (itemId) => {
    if (itemStatuses.all.includes(itemId)) return "bg-success";
    if (itemStatuses.few.includes(itemId)) return "bg-warning";
    if (itemStatuses.none.includes(itemId)) return "bg-danger";
    return "";
  };

  const selectedItem = selectedIndex !== null ? cartItems[selectedIndex] : null;

  if (loading) return <div className="text-center my-4">Loading...</div>;
  if (error)
    return <div className="text-center my-4 text-danger">Error: {error}</div>;

  return (
    <>
      <KitchenNavBar />
      <div className="containers">
        <div className="left-box">
          <span className="order-header">Order List</span>
          <div className="orders-list">
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <div
                  key={index}
                  className="order-box"
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
                    {selectedItem.items.length > 0 ||
                    selectedItem.combos.length > 0 ? (
                      <div className="row">
                        {[...selectedItem.items, ...selectedItem.combos].map(
                          (foodItem, idx) => (
                            <div key={idx} className="col-md-4 mb-4">
                              <div
                                className={`card ${
                                  foodItem.status === "Served"
                                    ? "bg-success text-light"
                                    : "bg-danger text-white"
                                }`}
                              >
                                <div className="card-body cards">
                                  <h5 className="card-title">
                                    {foodItem.name}
                                  </h5>
                                  <p
                                    className="card-text"
                                    style={{ fontSize: "2.25rem" }}
                                  >
                                    <strong>Count:</strong> {foodItem.count}
                                  </p>
                                  <p className="card-text">
                                    <strong>Status:</strong> {foodItem.status}
                                  </p>
                                  {foodItem.status !== "Served" && (
                                    <button
                                      className="btn blinking-button"
                                      onClick={() =>
                                        handleFinishClick(
                                          idx,
                                          selectedItem.combos.includes(foodItem)
                                        )
                                      }
                                    >
                                      Mark as Served
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
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
