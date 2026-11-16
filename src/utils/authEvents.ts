type Listener = () => void;

const logoutListeners = new Set<Listener>();

export const authEvents = {
  onLogout(listener: Listener) {
    logoutListeners.add(listener);
    return () => {
      logoutListeners.delete(listener);
    };
  },
  emitLogout() {
    logoutListeners.forEach((listener) => listener());
  },
};
