"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ZoomIn, ZoomOut } from 'lucide-react';
import type { PixelGrid } from '@/types';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { useStore } from '@/lib/store';

type Mode = 'collaborative' | 'personal' | 'room';

const PixelCanvas = () => {
  const {
    mode, setMode,
    selectedColor, setSelectedColor,
    collaborativePixels, personalPixels, setPixels,
    roomId, setRoomId
  } = useStore();

  const [canvasSize] = useState({ width: 250, height: 250 });
  const [lastPlacedTime, setLastPlacedTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showRoomDialog, setShowRoomDialog] = useState(false);

  const COOLDOWN_TIME = 300; // 5 minutes in seconds

  // Keep track of socket in a ref instead
  const socketRef = useRef<typeof Socket | null>(null);

  // Add zoom limits
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;

  // Add zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, MIN_ZOOM));
  };

  useEffect(() => {
    const initSocket = async () => {
      await fetch('/api/socket');
      socketRef.current = io();

      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      socketRef.current.on('pixel-update', (data: { x: number; y: number; color: string }) => {
        console.log('Received update:', data);
        setPixels(
          collaborativePixels.map((r, i) => 
            r.map((c, j) => i === data.y && j === data.x ? data.color : c)
          ),
          'collaborative'
        );
      });
    };

    initSocket();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Initialize canvases
  useEffect(() => {
    const initialPixels = Array(canvasSize.height).fill(null).map(() =>
      Array(canvasSize.width).fill('#FFFFFF')
    );
    setPixels(initialPixels, 'collaborative');
    setPixels(initialPixels, 'personal');
  }, [canvasSize]);
  
  // Timer logic
  useEffect(() => {
    if (!lastPlacedTime || mode === 'personal') return;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, COOLDOWN_TIME - Math.floor((now - lastPlacedTime) / 1000));
      setTimeLeft(diff);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [lastPlacedTime, mode]);
  
  const handlePixelClick = (row: number, col: number) => {
    if (mode !== 'personal') {
      const now = Date.now();
      if (lastPlacedTime && now - lastPlacedTime < COOLDOWN_TIME * 1000) return;
      
      setLastPlacedTime(now);
      setPixels(
        collaborativePixels.map((r, i) => 
          r.map((c, j) => i === row && j === col ? selectedColor : c)
        ),
        'collaborative'
      );
      
      socketRef.current?.emit('place-pixel', { 
        x: col, y: row, 
        color: selectedColor,
        roomId: mode === 'room' ? roomId : undefined 
      });
    } else {
      setPixels(
        personalPixels.map((r, i) => 
          r.map((c, j) => i === row && j === col ? selectedColor : c)
        ),
        'personal'
      );
    }
  };

  const activePixels = mode === 'personal' ? personalPixels : collaborativePixels;

  return (
    <div className="flex flex-col items-center gap-8 p-6 w-full max-w-[95vw] mx-auto">
      {/* Title and Description - wider */}
      <div className="text-center max-w-4xl w-full">
        <p className="text-lg text-gray-600 leading-relaxed">
          Welcome to a boundless digital canvas where every pixel tells a story. 
          Join fellow artists in crafting a living masterpiece, one square at a time. 
          Whether you&apos;re contributing to the global tapestry, creating in your personal space, 
          or collaborating with friends in private rooms, your creativity knows no bounds.
        </p>
      </div>

      {/* Mode Selector - wider */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 w-full max-w-6xl border border-gray-100">
        <div className="flex gap-6 justify-center items-center">
          {/* Modern Radio-style Mode Selector */}
          <div className="flex gap-3">
            <button
              onClick={() => setMode('collaborative')}
              className={`px-4 py-2 rounded-lg transition-all ${
                mode === 'collaborative' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🌍 Global Canvas
            </button>
            <button
              onClick={() => setMode('personal')}
              className={`px-4 py-2 rounded-lg transition-all ${
                mode === 'personal' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🎨 Personal
            </button>
            <button
              onClick={() => setMode('room')}
              className={`px-4 py-2 rounded-lg transition-all ${
                mode === 'room' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              👥 Room
            </button>
          </div>

          {/* Modern Room Input */}
          {mode === 'room' && (
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Room Code"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-100 border-0 focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
              />
              <button
                onClick={() => socketRef.current?.emit('join-room', roomId)}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Join
              </button>
              <button
                onClick={() => {
                  const newRoomId = Math.random().toString(36).substring(7);
                  setRoomId(newRoomId);
                  socketRef.current?.emit('create-room', newRoomId);
                }}
                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Create
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Card - wider */}
      <Card className="w-full max-w-[95vw] bg-white shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span>{(zoom * 100).toFixed(0)}%</span>
              <button 
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 bg-gray-50">
          {/* Tools Section */}
          <div className="flex justify-between items-start mb-8 bg-white p-6 rounded-lg shadow-sm">
            {/* Color Tools */}
            <div className="flex gap-12">
              {/* Custom Color */}
              <div className="flex flex-col items-center gap-2">
                <span className="font-medium text-sm text-gray-700">Custom Color</span>
                <input 
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-10 h-10 cursor-pointer border-2 rounded transition-all"
                />
              </div>
              
              {/* Preset Colors */}
              <div className="flex flex-col gap-2">
                <span className="font-medium text-sm text-gray-700">Quick Colors</span>
                <div className="flex gap-3 flex-wrap max-w-[600px]">
                  {[
                    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
                    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
                    '#008000', '#800000', '#008080', '#C0C0C0', '#808080'
                  ].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 border-2 rounded transition-all ${
                        selectedColor === color ? 'border-blue-500 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Timer */}
            {mode !== 'personal' && timeLeft > 0 && (
              <div className="bg-blue-50 px-4 py-2 rounded-full">
                <div className="flex items-center gap-2 text-blue-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Container */}
          <div className="bg-white rounded-lg shadow-sm overflow-auto p-6 max-h-[70vh] w-full">
            <div 
              style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${canvasSize.width}, 1fr)`,
                gap: '1px',
                transform: `scale(${zoom}) translateZ(0)`,
                transformOrigin: 'top left',
                backgroundColor: '#f0f0f0',
                padding: '1px',
                width: '100%',
                aspectRatio: '1 / 1'
              }}
            >
              {activePixels.map((row, rowIndex) => 
                row.map((color, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="aspect-square w-2 h-2 cursor-pointer hover:opacity-75 transition-opacity"
                    style={{ backgroundColor: color }}
                    onClick={() => handlePixelClick(rowIndex, colIndex)}
                  />
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PixelCanvas;