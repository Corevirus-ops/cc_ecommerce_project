import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import url from './url';

async function parseResponse(response) {
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Cart request failed');
  }
  return data;
}

const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const response = await fetch(`${url}/cart`, { credentials: 'include' });
  return parseResponse(response);
});

const addCartItem = createAsyncThunk('cart/addCartItem', async ({ productId, quantity }) => {
  const response = await fetch(`${url}/cart`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity })
  });
  return parseResponse(response);
});

const updateCartItem = createAsyncThunk('cart/updateCartItem', async ({ id, quantity }) => {
  const response = await fetch(`${url}/cart/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity })
  });
  return parseResponse(response);
});

const removeCartItem = createAsyncThunk('cart/removeCartItem', async (id) => {
  const response = await fetch(`${url}/cart/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  await parseResponse(response);
  return id;
});

const checkout = createAsyncThunk('cart/checkout', async () => {
  const response = await fetch(`${url}/cart/checkout`, {
    method: 'POST',
    credentials: 'include'
  });
  return parseResponse(response);
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartId: null,
    items: [],
    status: 'idle',
    actionStatus: 'idle',
    error: null,
    checkoutResult: null
  },
  reducers: {
    clearCart: (state) => {
      state.cartId = null;
      state.items = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cartId = action.payload.cartId;
        state.items = action.payload.items;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addCartItem.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.actionStatus = 'idle';
        const existing = state.items.find(item => item.id === action.payload.id);
        if (existing) {
          Object.assign(existing, action.payload);
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) state.items[index] = { ...state.items[index], ...action.payload };
        state.actionStatus = 'idle';
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.actionStatus = 'idle';
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(checkout.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.actionStatus = 'idle';
        state.items = [];
        state.checkoutResult = action.payload;
      })
      .addCase(checkout.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { clearCart } = cartSlice.actions;
export { fetchCart, addCartItem, updateCartItem, removeCartItem, checkout };
export default cartSlice.reducer;
