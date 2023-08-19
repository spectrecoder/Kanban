import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

interface useSidebarStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useSidebar = createWithEqualityFn<useSidebarStore>(
  (set) => ({
    isOpen: true,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  }),
  shallow
);
