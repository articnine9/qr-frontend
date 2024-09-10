import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

 
 
export const updateCartItems = createAsyncThunk( 
  'cart/updateCartItems', 
  async ({ id, updatedItems }, { dispatch }) => { 
    try { 
      console.log("Payload being sent:", { id, updatedItems }); 
      const response = await axios.put( 
        `https://qr-backend-application.onrender.com/cart/cartitems/${id}`, 
        { updatedItems }  
      ); 
      console.log("Response:", response);
      dispatch(fetchCartItems());  
    } catch (error) { 
      console.error("Error response:", error.response); 
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
    statusUpdation:false 
  }, 
  reducers: { 
    setSelectedIndex: (state, action) => { 
      state.selectedIndex = action.payload; 
      if (action.payload !== null) { 
        const selectedItem = state.cartItems[action.payload]; 
        if (selectedItem && selectedItem.items) { 
          state.updatedItems = selectedItem.items.map((item) => ({ 
            ...item, 
            status: item.status || 'not finished', 
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