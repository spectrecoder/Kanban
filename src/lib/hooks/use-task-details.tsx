import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

interface useTaskDetailsStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useTaskDetails = createWithEqualityFn<useTaskDetailsStore>(
  (set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  }),
  shallow
);
