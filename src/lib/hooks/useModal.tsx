import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

interface useModalStore {
  type:
    | "createBoard"
    | "deleteBoard"
    | "editBoard"
    | "createTask"
    | "sidebar"
    | "createColumn"
    | "";
  //   isOpen: boolean;
  onOpen: (type: useModalStore["type"]) => void;
  onClose: () => void;
}

export const useModal = createWithEqualityFn<useModalStore>(
  (set) => ({
    type: "",
    onOpen: (type: useModalStore["type"]) => set({ type }),
    onClose: () => set({ type: "" }),
  }),
  shallow
);
