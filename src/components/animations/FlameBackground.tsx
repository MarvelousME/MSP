'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';

export function FlameBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#020617] overflow-hidden">
      {/* Three.js Atmospheric Glows */}
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.5} />
        
        {/* Neon Teal Glow - Top Right */}
        <mesh position={[5, 3, -2]}>
          <sphereGeometry args={[8, 32, 32]} />
          <meshBasicMaterial color="#14b8a6" transparent opacity={0.05} />
        </mesh>

        {/* Electric Orange Glow - Bottom Left */}
        <mesh position={[-5, -3, -1]}>
          <sphereGeometry args={[6, 32, 32]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.08} />
        </mesh>

        {/* Central Atmospheric Deep Glow */}
        <mesh position={[0, -2, -3]}>
          <sphereGeometry args={[12, 32, 32]} />
          <meshBasicMaterial color="#0d9488" transparent opacity={0.03} />
        </mesh>
      </Canvas>

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-[0.15] pointer-events-none" />
      
      {/* Geometric Dots Overlay */}
      <div className="absolute inset-0 cyber-grid-dots opacity-[0.2] pointer-events-none" />

      {/* Moving Scanline */}
      <div className="absolute inset-0 cyber-scanline pointer-events-none" />

      {/* Radiant Vignette for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.9)_100%)] pointer-events-none" />

      {/* Subtle Horizontal Glitch Line (Animated with CSS) */}
      <motion.div 
        animate={{ 
          top: ["0%", "100%", "0%"],
          opacity: [0, 0.1, 0]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute left-0 w-full h-[1px] bg-teal-500/30 blur-[1px] pointer-events-none z-10"
      />
    </div>
  );
}
