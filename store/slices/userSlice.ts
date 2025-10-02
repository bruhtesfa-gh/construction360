import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

export interface UserState {
  userProfile: {
    builderId?: string;
    [key: string]: any;
  } | null;
}

const getUserFromCookie = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/user=([^;]+)/);
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {
      return null;
    }
  }
  return null;
};

const initialState: UserState = {
  userProfile: getUserFromCookie(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState['userProfile']>) {
      state.userProfile = action.payload;
    },
    clearUser(state) {
      state.userProfile = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export const selectUser = (state: RootState) => state.user.userProfile;
export default userSlice.reducer;
