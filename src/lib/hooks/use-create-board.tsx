import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

interface useCreateBoardStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreateBoard = createWithEqualityFn<useCreateBoardStore>(
  (set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  }),
  shallow
);
