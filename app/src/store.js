import { configureStore } from '@reduxjs/toolkit'
import authReducer from './tools/auth'
import productReducer from './tools/productSlice'
import productDetailsReducer from './tools/productDetailsSlice'
import cartReducer from './tools/cartSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    productDetails: productDetailsReducer,
    cart: cartReducer,
  }
})

export default store