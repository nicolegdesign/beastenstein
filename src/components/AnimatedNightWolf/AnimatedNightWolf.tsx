import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedNightWolf.css';

interface AnimatedNightWolfProps {
  mood?: 'normal' | 'happy' | 'sad' | 'rest';
  size?: number;
}

// Configuration for mood-specific pieces
// To add new mood variants:
// 1. Add the new SVG file to /public/images/beasts/night-wolf/
// 2. Update the appropriate piece configuration below
// 3. The component will automatically use the new piece for that mood
const NIGHT_WOLF_PIECES = {
  head: {
    normal: './images/beasts/night-wolf/night-wolf-head.svg',
    happy: './images/beasts/night-wolf/night-wolf-head-happy.svg',
    sad: './images/beasts/night-wolf/night-wolf-head.svg', // Can add sad variant later
    rest: './images/beasts/night-wolf/night-wolf-head.svg', // Can add rest variant later
  },
  torso: {
    normal: './images/beasts/night-wolf/night-wolf-torso.svg',
    happy: './images/beasts/night-wolf/night-wolf-torso.svg', // Can add variants later
    sad: './images/beasts/night-wolf/night-wolf-torso.svg',
    rest: './images/beasts/night-wolf/night-wolf-torso.svg',
  },
  armLeft: {
    normal: './images/beasts/night-wolf/night-wolf-arm-l.svg',
    happy: './images/beasts/night-wolf/night-wolf-arm-l.svg',
    sad: './images/beasts/night-wolf/night-wolf-arm-l.svg',
    rest: './images/beasts/night-wolf/night-wolf-arm-l.svg',
  },
  armRight: {
    normal: './images/beasts/night-wolf/night-wolf-arm-r.svg',
    happy: './images/beasts/night-wolf/night-wolf-arm-r.svg',
    sad: './images/beasts/night-wolf/night-wolf-arm-r.svg',
    rest: './images/beasts/night-wolf/night-wolf-arm-r.svg',
  },
  legLeft: {
    normal: './images/beasts/night-wolf/night-wolf-leg-l.svg',
    happy: './images/beasts/night-wolf/night-wolf-leg-l.svg',
    sad: './images/beasts/night-wolf/night-wolf-leg-l.svg',
    rest: './images/beasts/night-wolf/night-wolf-leg-l.svg',
  },
  legRight: {
    normal: './images/beasts/night-wolf/night-wolf-leg-r.svg',
    happy: './images/beasts/night-wolf/night-wolf-leg-r.svg',
    sad: './images/beasts/night-wolf/night-wolf-leg-r.svg',
    rest: './images/beasts/night-wolf/night-wolf-leg-r.svg',
  },
};

export const AnimatedNightWolf: React.FC<AnimatedNightWolfProps> = ({ 
  mood = 'normal',
  size = 100 
}) => {
  // Get the appropriate piece for the current mood
  const getPieceUrl = (piece: keyof typeof NIGHT_WOLF_PIECES): string => {
    return NIGHT_WOLF_PIECES[piece][mood] || NIGHT_WOLF_PIECES[piece].normal;
  };

  // Adjust animation intensity based on mood
  const getAnimationScale = (): number => {
    switch (mood) {
      case 'happy':
        return 1.5; // More energetic
      case 'sad':
        return 0.5; // Slower, more subdued
      case 'rest':
        return 0.3; // Very gentle breathing-like motion
      default:
        return 1; // Normal idle
    }
  };

  const scale = getAnimationScale();

  return (
    <div 
      className="animated-night-wolf"
      style={{ 
        width: size, 
        height: size * 1.2, // Maintain aspect ratio
        position: 'relative'
      }}
    >
      <div className="night-wolf-container">
        
        {/* Left Leg (back layer) */}
        <motion.img
          src={getPieceUrl('legLeft')}
          alt="Night Wolf Left Leg"
          className="night-wolf-part night-wolf-leg-left"
          animate={{
            rotate: [0, 3 * scale, 0, -2 * scale, 0],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4
          }}
          style={{ 
            transformOrigin: "50% 15%", // Hip connection to torso
            width: '46%',
            height: '49%',
            left: '59%',
            bottom: '0%',
            zIndex: 2
          }}
        />

        {/* Right Leg (back layer) */}
        <motion.img
          src={getPieceUrl('legRight')}
          alt="Night Wolf Right Leg"
          className="night-wolf-part night-wolf-leg-right"
          animate={{
            rotate: [0, -2 * scale, 0, 3 * scale, 0],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.9
          }}
          style={{ 
            transformOrigin: "50% 15%", // Hip connection to torso
            width: '42%',
            height: '45%',
            right: '34%',
            bottom: '0%',
            zIndex: 1
          }}
        />

        {/* Torso (center layer - main body) */}
        <motion.img
          src={getPieceUrl('torso')}
          alt="Night Wolf Torso"
          className="night-wolf-part night-wolf-torso"
          animate={{
            y: [0, -1.5 * scale, 0],
            scaleY: [1, 1 + (0.03 * scale), 1], // Breathing effect
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '55%',
            height: '65%',
            left: '22.5%',
            bottom: '18%',
            zIndex: 4
          }}
        />

        {/* Left Arm (front layer) */}
        <motion.img
          src={getPieceUrl('armLeft')}
          alt="Night Wolf Left Arm"
          className="night-wolf-part night-wolf-arm-left"
          animate={{
            rotate: [0, 5 * scale, 0, -3 * scale, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.1
          }}
          style={{ 
            transformOrigin: "75% 25%", // Shoulder connection
            width: '45%',
            height: '39%',
            left: '9%',
            top: '24%',
            zIndex: 3
          }}
        />

        {/* Right Arm (front layer) */}
        <motion.img
          src={getPieceUrl('armRight')}
          alt="Night Wolf Right Arm"
          className="night-wolf-part night-wolf-arm-right"
          animate={{
            rotate: [0, -3 * scale, 0, 5 * scale, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6
          }}
          style={{ 
            transformOrigin: "25% 25%", // Shoulder connection
            width: '45%',
            height: '39%',
            right: '26%',
            top: '17%',
            zIndex: 6
          }}
        />

        {/* Head (top layer) */}
        <motion.img
          src={getPieceUrl('head')}
          alt="Night Wolf Head"
          className="night-wolf-part night-wolf-head"
          animate={{
            y: [0, -2 * scale, 0],
            rotate: [0, 1.5 * scale, 0, -1.5 * scale, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '63%',
            height: '54%',
            left: '5%',
            top: '2%',
            zIndex: 5
          }}
        />

      </div>
    </div>
  );
};