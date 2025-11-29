import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export const authKey = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID}-jwt`;

/**
 * This store manages the authentication state of the application.
 */
export const useAuthStore = create((set) => ({
  isReady: false,
  auth: null,
  setAuth: async (auth) => {
    // Update state immediately for responsiveness
    set({ auth });

    // Then persist to secure storage (with error handling)
    try {
      if (auth) {
        await SecureStore.setItemAsync(authKey, JSON.stringify(auth));
      } else {
        await SecureStore.deleteItemAsync(authKey);
      }
    } catch (error) {
      console.error('Failed to persist auth state to SecureStore:', error);
      // State is already set, so the app can continue working
      // but we should log this error for debugging
    }
  },
}));

/**
 * This store manages the state of the authentication modal.
 */
export const useAuthModal = create((set) => ({
  isOpen: false,
  mode: 'signup',
  open: (options) => set({ isOpen: true, mode: options?.mode || 'signup' }),
  close: () => set({ isOpen: false }),
}));