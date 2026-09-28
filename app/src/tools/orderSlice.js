import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import url from './url';

async function parseResponse(response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Unable to load orders');
  return data;
}

const fetchOrders = createAsyncThunk('orders/fetchOrders', async () => {
  const response = await fetch(`${url}/orders`, { credentials: 'include' });
  return parseResponse(response);
});

const fetchOrderById = createAsyncThunk('orders/fetchOrderById', async (id) => {
  const response = await fetch(`${url}/orders/${id}`, { credentials: 'include' });
  return parseResponse(response);
});

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    selectedOrder: null,
    status: 'idle',
    detailStatus: 'idle',
    error: null,
  },
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
      state.detailStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload.orders;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.detailStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selectedOrder = action.payload.order;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setOrders, clearSelectedOrder } = orderSlice.actions;
export { fetchOrders, fetchOrderById };
export default orderSlice.reducer;
