import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

interface useEditBoardStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useEditBoard = createWithEqualityFn<useEditBoardStore>(
  (set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  }),
  shallow
);
