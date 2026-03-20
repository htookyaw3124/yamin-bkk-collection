import { configureStore } from '@reduxjs/toolkit';
import { TWINApi } from './api';

export const store = configureStore({
  reducer: {
    [TWINApi.reducerPath]: TWINApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(TWINApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
