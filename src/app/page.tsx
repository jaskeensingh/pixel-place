"use client"

import PixelCanvas from '@/components/PixelCanvas'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Pixel Place</h1>
      <div className="flex justify-center">
        <PixelCanvas />
      </div>
    </main>
  )
}
