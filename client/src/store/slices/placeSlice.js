import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Fetch All Places
export const fetchPlaces = createAsyncThunk('places/fetchPlaces', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/places');
    return response.data?.places || response.data?.data || response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch places');
  }
});

// 2. Create New Place / Spot (REQUIRED BY AddPlace.jsx)
export const createPlace = createAsyncThunk('places/createPlace', async (placeData, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/places', placeData);
    return response.data?.place || response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create place');
  }
});

// Alias export in case component imports addPlace
export const addPlace = createPlace;

// 3. Toggle Like Place (REQUIRED BY PlaceCard.jsx)
export const toggleLikePlace = createAsyncThunk('places/toggleLikePlace', async (placeId, { rejectWithValue }) => {
  try {
    const response = await axios.post(`/api/places/${placeId}/like`);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update like');
  }
});

// 4. Add Review To Place (REQUIRED BY PlaceDetailModal.jsx)
export const addReviewToPlace = createAsyncThunk(
  'places/addReviewToPlace',
  async ({ placeId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/places/${placeId}/reviews`, reviewData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add review');
    }
  }
);

const placeSlice = createSlice({
  name: 'places',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filterCategory: 'All',
  },
  reducers: {
    setFilter: (state, action) => {
      state.filterCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Places
      .addCase(fetchPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaces.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      })

      // Create Place
      .addCase(createPlace.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })

      // Toggle Like
      .addCase(toggleLikePlace.fulfilled, (state, action) => {
        const updated = action.payload;
        const id = updated._id || updated.id;
        const index = state.items.findIndex((p) => (p._id || p.id) === id);
        if (index !== -1) {
          state.items[index] = updated;
        }
      })

      // Add Review
      .addCase(addReviewToPlace.fulfilled, (state, action) => {
        const updated = action.payload;
        const id = updated._id || updated.id;
        const index = state.items.findIndex((p) => (p._id || p.id) === id);
        if (index !== -1) {
          state.items[index] = updated;
        }
      });
  },
});

export const { setFilter } = placeSlice.actions;
export default placeSlice.reducer;