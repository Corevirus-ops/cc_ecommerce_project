import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import url from './url';

const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id, { rejectWithValue }) => {
        const response = await fetch(`${url}/products/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch product');
        }
        if (response.ok) {
            return await response.json();
        } else {
            const data = await response.json();
            return rejectWithValue(data)
        }
    }
);

const productDetailsSlice = createSlice({
    name: 'productDetails',
    initialState: {
        item: null,
        status: 'idle',
        error: null
    },
    reducers: {
        clearProductDetails: (state) => {
            state.item = null;
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProductById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.item = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch product';
            });
    }
});

export const { clearProductDetails } = productDetailsSlice.actions;
export { fetchProductById };
export default productDetailsSlice.reducer;