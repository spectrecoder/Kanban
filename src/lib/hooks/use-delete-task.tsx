import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

interface useDeleteTaskStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useDeleteTask = createWithEqualityFn<useDeleteTaskStore>(
  (set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  }),
  shallow
);
