import {createAsyncThunk, createSlice } from '@reduxjs/toolkit'
const url = 'http://localhost:3000'; 

const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        const response = await fetch(`${url}/users`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        if (!response.ok) {
            return rejectWithValue(data)
        }
        return data
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
        return response
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
        return response.status === 204 ? null : response
    }
)

const register = createAsyncThunk(
    'auth/register',
    async (credentials, { rejectWithValue }) => {
        const { ...registrationData } = credentials;
        const response = await fetch(`${url}/register`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        })
        const data = await response.json()
        if (!response.ok) {
            return rejectWithValue(data)
        }
        return data
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
    ,
    extraReducers: (builder) => {
        builder
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.user = null
            })
    }
})

export const { setUser, clearUser } = authSlice.actions
export { getCurrentUser, login, logout, register }
export default authSlice.reducer