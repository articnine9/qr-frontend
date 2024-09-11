import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async Thunks
export const updateCartItems = createAsyncThunk(
  'cart/updateCartItems',
  async ({ id, updatedItems, isCombo }, { dispatch }) => {
    try {
      const response = await axios.put(
        `https://qr-backend-application.onrender.com/cart/cartitems/${id}`,
        { updatedItems, isCombo }
      );
      return response.data;
    } catch (error) {
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
    statusUpdation: false
  },
  reducers: {
    setSelectedIndex: (state, action) => {
      state.selectedIndex = action.payload;
      if (action.payload !== null) {
        const selectedItem = state.cartItems[action.payload];
        if (selectedItem) {
          state.updatedItems = [...selectedItem.items, ...selectedItem.combos].map((item) => ({
            ...item,
            status: item.status || 'not served',
          }));
        }
      }
    },
    handleFinishClick: (state, action) => {
      const { foodItemIndex, isCombo } = action.payload;
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
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setStatusUpdation: (state, action) => {
      state.statusUpdation = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.loading = false;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItems.fulfilled, (state) => {
        state.loading = false;
        state.statusUpdation = true;
      })
      .addCase(updateCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const {
  setSelectedIndex,
  handleFinishClick,
  resetSelectedIndex,
  setCartItems,
  setLoading,
  setError,
  setStatusUpdation
} = cartSlice.actions;

export default cartSlice.reducer;
