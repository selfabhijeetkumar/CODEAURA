import { create } from 'zustand';

interface UIState {
  commandBarOpen: boolean;
  askAIOpen: boolean;
  optimizationDrawerOpen: boolean;
  editorVisible: boolean;
  fullscreen: boolean;
  cursorPosition: { x: number; y: number };
  setCursorPosition: (x: number, y: number) => void;
  setCommandBar: (open: boolean) => void;
  setAskAI: (open: boolean) => void;
  setOptimizationDrawer: (open: boolean) => void;
  toggleEditor: () => void;
  toggleFullscreen: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  commandBarOpen: false,
  askAIOpen: false,
  optimizationDrawerOpen: false,
  editorVisible: true,
  fullscreen: false,
  cursorPosition: { x: 0, y: 0 },

  setCursorPosition: (x, y) => set({ cursorPosition: { x, y } }),
  setCommandBar: (open) => set({ commandBarOpen: open }),
  setAskAI: (open) => set({ askAIOpen: open }),
  setOptimizationDrawer: (open) => set({ optimizationDrawerOpen: open }),
  toggleEditor: () => set((s) => ({ editorVisible: !s.editorVisible })),
  toggleFullscreen: () => set((s) => ({ fullscreen: !s.fullscreen })),
}));
