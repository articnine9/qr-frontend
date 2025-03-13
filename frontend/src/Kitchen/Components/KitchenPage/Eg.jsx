const handleFinishClick = (foodItemIndex, isCombo = false) => {
  if (selectedIndex !== null) {
    const cartItemId = cartItems[selectedIndex]._id;
    const selectedItem = cartItems[selectedIndex];
    let foodItem;

    // If it's a combo, access the combo array, otherwise access the items array
    if (isCombo) {
      foodItem = selectedItem.combos[foodItemIndex];
    } else {
      foodItem = selectedItem.items[foodItemIndex];
    }

    if (foodItem) {
      const url = `https://qr-backend-application.onrender.com/cart/cartitems/${cartItemId}/item/${foodItem._id}`;
      console.log("Sending request to update:", url);  // Log request URL and data
      axios
        .put(url)
        .then((response) => {
          console.log("Status updated successfully:", response.data);
          setCartItems((prevItems) =>
            prevItems.map((item) =>
              item._id === cartItemId
                ? {
                    ...item,
                    items: item.items.map((i) =>
                      i._id === foodItem._id ? { ...i, status: "Served" } : i
                    ),
                    combos: item.combos.map((c) =>
                      c._id === foodItem._id ? { ...c, status: "Served" } : c
                    ),
                  }
                : item
            )
          );
        })
        .catch((error) => {
          console.error("Error updating item status:", error);
          alert("Failed to update item status. Please try again later.");
        });
    } else {
      console.error("Food item not found at index", foodItemIndex);
    }
  } else {
    console.error("No selected index available.");
  }
};
