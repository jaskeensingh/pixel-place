import { create } from 'zustand'
import type { PixelGrid } from '@/types'

type Mode = 'collaborative' | 'personal' | 'room'

interface Store {
  // Canvas State
  collaborativePixels: PixelGrid
  personalPixels: PixelGrid
  setPixels: (pixels: PixelGrid, mode: 'collaborative' | 'personal') => void
  
  // Mode State
  mode: Mode
  setMode: (mode: Mode) => void
  
  // Color State
  selectedColor: string
  setSelectedColor: (color: string) => void
  
  // Room State
  roomId: string
  setRoomId: (id: string) => void
}

export const useStore = create<Store>((set) => ({
  // Initial state and actions
  collaborativePixels: [],
  personalPixels: [],
  setPixels: (pixels, mode) => set(state => ({
    [mode === 'collaborative' ? 'collaborativePixels' : 'personalPixels']: pixels
  })),
  
  mode: 'collaborative',
  setMode: (mode) => set({ mode }),
  
  selectedColor: '#000000',
  setSelectedColor: (color) => set({ selectedColor: color }),
  
  roomId: '',
  setRoomId: (id) => set({ roomId: id })
})) 