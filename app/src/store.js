import { configureStore } from '@reduxjs/toolkit'
import authReducer from './tools/auth'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  }
})

export default store