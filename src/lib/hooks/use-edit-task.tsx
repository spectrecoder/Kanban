import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

interface useEditTaskStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useEditTask = createWithEqualityFn<useEditTaskStore>(
  (set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  }),
  shallow
);
