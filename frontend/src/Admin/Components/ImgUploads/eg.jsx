const handleFinishClickWrapper = (foodItemIndex) => {
  setPendingUpdateIndex(foodItemIndex); // Set the index for the item to be updated
};

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
        console.error('Failed to update cart:', error.message);
        setPendingUpdateIndex(null); // Reset pending update index even if there's an error
      });
  }
}, [pendingUpdateIndex, selectedIndex, updatedItems, cartItems, dispatch]);
