import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';




export const updateCartItems = createAsyncThunk(
  'cart/updateCartItems',
  async ({ id, updatedItems }, { dispatch }) => {
    try {
      console.log("Payload being sent:", { id, updatedItems }); // Debugging line
      const response = await axios.put(
        `https://qr-backend-application.onrender.com/cart/cartitems/${id}`,
        { updatedItems } // Adjust this if necessary based on server's expected format
      );
      console.log("Response:", response); // Debugging line
      dispatch(fetchCartItems()); 
    } catch (error) {
      console.error("Error response:", error.response); // Log the error response for debugging
      throw new Error(error.response ? error.response.data : error.message);
    }
  }
);



export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async () => {
    const response = await axios.get('https://qr-backend-application.onrender.com/cart/items');
    return response.data;
  }
);


// Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: [],
    selectedIndex: null,
    updatedItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedIndex: (state, action) => {
      state.selectedIndex = action.payload;
      if (action.payload !== null) {
        const selectedItem = state.cartItems[action.payload];
        if (selectedItem && selectedItem.items) {
          state.updatedItems = selectedItem.items.map((item) => ({
            ...item,
            status: item.status || 'not served',
          }));
        }
      }
    },
    handleFinishClick: (state, action) => {
      const { foodItemIndex } = action.payload;
      if (foodItemIndex >= 0 && foodItemIndex < state.updatedItems.length) {
        state.updatedItems[foodItemIndex] = {
          ...state.updatedItems[foodItemIndex],
          status: 'served',
        };
      }
    },
    resetSelectedIndex: (state) => {
      state.selectedIndex = null;
      state.updatedItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.loading = false;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(updateCartItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItems.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateCartItems.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export const { setSelectedIndex, handleFinishClick, resetSelectedIndex } = cartSlice.actions;
export default cartSlice.reducer;
