import { configureStore, createSlice } from '@reduxjs/toolkit';

const localPasswordToken = 'local-password-token';
const localPasswordUser = { id: '000000000000000000000001', _id: '000000000000000000000001', name: 'GSR Admin', role: 'admin' };

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null') || localPasswordUser,
  },
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    clearCredentials(state) {
      state.token = '';
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
const uiSlice = createSlice({
  name: 'ui',
  initialState: { darkMode: localStorage.getItem('darkMode') === 'true' },
  reducers: {
    toggleDark(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    setDark(state, action) {
      state.darkMode = !!action.payload;
      localStorage.setItem('darkMode', state.darkMode);
    },
  },
});

export const { toggleDark, setDark } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
  },
});