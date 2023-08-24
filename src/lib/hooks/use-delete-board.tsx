import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

interface useDeleteBoardStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useDeleteBoard = createWithEqualityFn<useDeleteBoardStore>(
  (set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  }),
  shallow
);
