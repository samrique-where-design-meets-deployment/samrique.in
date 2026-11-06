// Simple reactive state manager
class AppStore {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

// Initialize global store for Samrique brand site
export const store = new AppStore({
  activeFilter: "all", // Options: 'all', 'flutter', 'backend', 'ecommerce'
  isContactModalOpen: false, // Controls contact popup visibility
  formSubmitting: false, // Contact form loading state
  formSuccess: false, // Success feedback toggle
});
