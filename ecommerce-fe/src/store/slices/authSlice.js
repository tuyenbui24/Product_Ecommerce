import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authApi from "@/api/authApi";
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from "@/utils/storage";

export const loginUserThunk = createAsyncThunk("auth/loginUser", async (payload, { rejectWithValue }) => {
  try {
    // BE trả JwtResponse { token, id, email, firstName, lastName, roles: [...] }
    const { data } = await authApi.loginUser(payload);
    const { token, ...user } = data;
    setToken(token);
    setUser(user);
    return user;
  } catch (e) {
    return rejectWithValue(e.response?.data || { message: "Login failed" });
  }
});

export const loginStaffThunk = createAsyncThunk("auth/loginStaff", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.loginStaff(payload);
    const { token, ...user } = data;
    setToken(token);
    setUser(user);
    return user;
  } catch (e) {
    return rejectWithValue(e.response?.data || { message: "Login failed" });
  }
});

/** Load lại hồ sơ sau F5 (khi đã có token) */
export const fetchMeThunk = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const { data } = await authApi.me();
    setUser(data);
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data || { message: "Fetch me failed" });
  }
});

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  removeToken();
  removeUser();
  return null;
});

const slice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: !!getToken(),
    user: getUser(),
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(loginUserThunk.pending,   (s)=>{ s.loading=true; s.error=null; })
      .addCase(loginUserThunk.fulfilled, (s,a)=>{ s.loading=false; s.isAuthenticated=true; s.user=a.payload; })
      .addCase(loginUserThunk.rejected,  (s,a)=>{ s.loading=false; s.error=a.payload || a.error; })

      .addCase(loginStaffThunk.pending,   (s)=>{ s.loading=true; s.error=null; })
      .addCase(loginStaffThunk.fulfilled, (s,a)=>{ s.loading=false; s.isAuthenticated=true; s.user=a.payload; })
      .addCase(loginStaffThunk.rejected,  (s,a)=>{ s.loading=false; s.error=a.payload || a.error; })

      .addCase(fetchMeThunk.fulfilled, (s,a)=> { s.isAuthenticated=true; s.user=a.payload; })

      .addCase(logoutThunk.fulfilled,  (s)=> { s.isAuthenticated=false; s.user=null; });
  },
});

export default slice.reducer;
