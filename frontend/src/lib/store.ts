import { configureStore } from '@reduxjs/toolkit';
import { yaminApi } from './api';

export const store = configureStore({
  reducer: {
    [yaminApi.reducerPath]: yaminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(yaminApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
