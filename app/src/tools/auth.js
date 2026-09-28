import {createAsyncThunk, createSlice } from '@reduxjs/toolkit'
const url = 'http://localhost:3000'; 

const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async () => {
        const response = await fetch(`${url}/users`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return response.json()
    }
)

const login = createAsyncThunk(
    'auth/login',
    async (credentials) => {
        const response = await fetch(`${url}/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        })
        return response.json()
    }
)

const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        const response = await fetch(`${url}/logout`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return response.status === 204 ? null : response.json()
    }
)


const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null
    },
    reducers: {
        setUser(state, action) {
            state.user = action.payload
        },
        clearUser(state) {
            state.user = null
        },
    }
})

export const { setUser, clearUser } = authSlice.actions
export { getCurrentUser, login, logout }
export default authSlice.reducer