import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import url from './url';

const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (_, { rejectWithValue }) => {
        const response = await fetch(`${url}/products`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
       if (response.ok) {
        return await response.json();
       } else {
        const data = await response.json();
        return rejectWithValue(data)
       }
    }
);


const productSlice = createSlice({
    name: 'products',
    initialState: {
        items: [],
        status: 'idle',
        error: null
    },
    reducers: {
        setProducts: (state, action) => {
            state.items = action.payload;
        },
        clearProducts: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch products';
            });
    },
});



export const { setProducts, clearProducts } = productSlice.actions;
export { fetchProducts };
export default productSlice.reducer;

