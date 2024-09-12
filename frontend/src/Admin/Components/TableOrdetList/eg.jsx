// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// // Async Thunks
// export const updateCartItems = createAsyncThunk(
//   'cart/updateCartItems',
//   async ({ id, updatedItems, isCombo }, { dispatch }) => {
//     try {
//       const response = await axios.put(
//         `https://qr-backend-application.onrender.com/cart/cartitems/${id}`,
//         { updatedItems, isCombo }
//       );
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response ? error.response.data : error.message);
//     }
//   }
// );

// export const fetchCartItems = createAsyncThunk(
//   'cart/fetchCartItems',
//   async () => {
//     const response = await axios.get('https://qr-backend-application.onrender.com/cart/items');
//     return response.data;
//   }
// );

// // Slice
// const cartSlice = createSlice({
//   name: 'cart',
//   initialState: {
//     cartItems: [],
//     selectedIndex: null,
//     updatedItems: [],
//     loading: false,
//     error: null,
//     statusUpdation: false
//   },
//   reducers: {
//     setSelectedIndex: (state, action) => {
//       state.selectedIndex = action.payload;
//       if (action.payload !== null) {
//         const selectedItem = state.cartItems[action.payload];
//         if (selectedItem) {
//           state.updatedItems = [...selectedItem.items, ...selectedItem.combos].map((item) => ({
//             ...item,
//             status: item.status || 'not served',
//           }));
//         }
//       }
//     },
//     handleFinishClick: (state, action) => {
//       const { foodItemIndex, isCombo } = action.payload;
//       if (foodItemIndex >= 0 && foodItemIndex < state.updatedItems.length) {
//         state.updatedItems[foodItemIndex] = {
//           ...state.updatedItems[foodItemIndex],
//           status: 'served',
//         };
//       }
//     },
//     resetSelectedIndex: (state) => {
//       state.selectedIndex = null;
//       state.updatedItems = [];
//     },
//     setCartItems: (state, action) => {
//       state.cartItems = action.payload;
//     },
//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },
//     setError: (state, action) => {
//       state.error = action.payload;
//     },
//     setStatusUpdation: (state, action) => {
//       state.statusUpdation = action.payload;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchCartItems.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchCartItems.fulfilled, (state, action) => {
//         state.cartItems = action.payload;
//         state.loading = false;
//       })
//       .addCase(fetchCartItems.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//       })
//       .addCase(updateCartItems.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateCartItems.fulfilled, (state) => {
//         state.loading = false;
//         state.statusUpdation = true;
//       })
//       .addCase(updateCartItems.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//       });
//   }
// });

// export const {
//   setSelectedIndex,
//   handleFinishClick,
//   resetSelectedIndex,
//   setCartItems,
//   setLoading,
//   setError,
//   setStatusUpdation
// } = cartSlice.actions;

// export default cartSlice.reducer;

export const updateCartItems = createAsyncThunk(
  "cart/updateCartItems",
  async ({ id, updatedItems, isCombo }, { dispatch }) => {
    try {
      await axios.put(
        `https://qr-backend-application.onrender.com/cart/cartitems/${id}`,
        { updatedItems }
      );

      dispatch(fetchCartItems());
    } catch (error) {
      console.error("Error response:", error.response);
      throw new Error(error.response ? error.response.data : error.message);
    }
  }
);

useEffect(() => {
  if (pendingUpdate !== null && selectedIndex !== null) {
    const { foodItemIndex, cartItemId, isCombo } = pendingUpdate;

    const cartItem = cartItems[selectedIndex];
    const updatedItems = isCombo ? cartItem.combos : cartItem.items;

    // Update specific item status
    updatedItems[foodItemIndex] = {
      ...updatedItems[foodItemIndex],
      status: "served",
    };

    // Prepare updatedItems for the payload
    const payload = {
      id: cartItemId,
      updatedItems: isCombo
        ? { combos: updatedItems }
        : { items: updatedItems },
      isCombo,
    };

    dispatch(updateCartItems(payload))
      .unwrap()
      .then(() => {
        axios
          .get("https://qr-backend-application.onrender.com/cart/items")
          .then((response) => {
            setCartItems(response.data);
          })
          .catch((err) =>
            console.error("Failed to refetch cart items:", err.message)
          );
        setPendingUpdate(null);
      })
      .catch((error) => {
        console.error("Failed to update cart:", error.message);
        setPendingUpdate(null);
      });
  }
}, [pendingUpdate, selectedIndex, cartItems, dispatch]);


cartRouter.put("/cartitems/:id", async (req, res) => {
  const { id } = req.params;
  const { updatedItems, updatedCombos } = req.body;

  // Validate input data
  if (
    !Array.isArray(updatedItems) ||
    !Array.isArray(updatedCombos) ||
    updatedItems.some(
      (item) =>
        !item._id ||
        !item.name ||
        !item.type ||
        !item.price ||
        !item.categoryName ||
        !item.count ||
        !item.status
    ) ||
    updatedCombos.some(
      (combo) =>
        !combo._id ||
        !combo.name ||
        !combo.items ||
        !combo.price ||
        !combo.status
    )
  ) {
    console.error("Invalid input data:", req.body);
    return res.status(400).json({ error: "Invalid input data" });
  }

  try {
    const database = await db.getDatabase();
    const collection = database.collection("cart");

    // Update both items and combos
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { items: updatedItems, combos: updatedCombos } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Cart updated successfully" });
    } else {
      res.status(404).json({ error: "Cart item not found" });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Error updating cart", details: error.message });
  }
});


useEffect(() => {
  if (cartItems.length > 0) {
    const statuses = { all: [], few: [], none: [] };

    cartItems.forEach((item) => {
      if (!item || !item.items || !item.combos) {
        console.warn("Missing items or combos in cart item:", item);
        return; // Skip this item
      }

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
