import { create } from 'zustand';

interface PlaybackState {
  isPlaying: boolean;
  speed: 0.5 | 1 | 1.5 | 2;
  progress: number; // 0..1
  loop: boolean;
  autoAdvance: boolean; // false = manual step-by-step; true = play through
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (speed: 0.5 | 1 | 1.5 | 2) => void;
  setProgress: (progress: number) => void;
  setLoop: (loop: boolean) => void;
  setAutoAdvance: (autoAdvance: boolean) => void;
  reset: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  isPlaying: false,
  speed: 1,
  progress: 0,
  loop: false,
  autoAdvance: false, // DEFAULT: manual — pause after every step

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setSpeed: (speed) => set({ speed }),
  setProgress: (progress) => set({ progress }),
  setLoop: (loop) => set({ loop }),
  setAutoAdvance: (autoAdvance) => set({ autoAdvance }),
  reset: () => set({ isPlaying: false, progress: 0 }),
}));
