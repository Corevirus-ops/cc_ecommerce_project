import { configureStore } from '@reduxjs/toolkit'
import authReducer from './tools/auth'
import productReducer from './tools/productSlice'
import productDetailsReducer from './tools/productDetailsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    productDetails: productDetailsReducer,
  }
})

export default store