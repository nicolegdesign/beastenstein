import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedMountainDragon.css';

interface AnimatedMountainDragonProps {
  mood?: 'normal' | 'happy' | 'sad' | 'rest';
  size?: number;
}

// Configuration for mood-specific pieces
// To add new mood variants:
// 1. Add the new SVG file to /public/images/beasts/mountain-dragon/
// 2. Update the appropriate piece configuration below
// 3. The component will automatically use the new piece for that mood
const MOUNTAIN_DRAGON_PIECES = {
  head: {
    normal: './images/beasts/mountain-dragon/mountain-dragon-head.svg',
    happy: './images/beasts/mountain-dragon/mountain-dragon-head.svg',
    sad: './images/beasts/mountain-dragon/mountain-dragon-head.svg',
    rest: './images/beasts/mountain-dragon/mountain-dragon-head.svg',
  },
  torso: {
    normal: './images/beasts/mountain-dragon/mountain-dragon-torso.svg',
    happy: './images/beasts/mountain-dragon/mountain-dragon-torso.svg',
    sad: './images/beasts/mountain-dragon/mountain-dragon-torso.svg',
    rest: './images/beasts/mountain-dragon/mountain-dragon-torso.svg',
  },
  armLeft: {
    normal: './images/beasts/mountain-dragon/mountain-dragon-arm-l.svg',
    happy: './images/beasts/mountain-dragon/mountain-dragon-arm-l.svg',
    sad: './images/beasts/mountain-dragon/mountain-dragon-arm-l.svg',
    rest: './images/beasts/mountain-dragon/mountain-dragon-arm-l.svg',
  },
  armRight: {
    normal: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg',
    happy: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg',
    sad: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg',
    rest: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg',
  },
  legLeft: {
    normal: './images/beasts/mountain-dragon/mountain-dragon-leg-l.svg',
    happy: './images/beasts/mountain-dragon/mountain-dragon-leg-l.svg',
    sad: './images/beasts/mountain-dragon/mountain-dragon-leg-l.svg',
    rest: './images/beasts/mountain-dragon/mountain-dragon-leg-l.svg',
  },
  legRight: {
    normal: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg',
    happy: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg',
    sad: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg',
    rest: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg',
  },
};

export const AnimatedMountainDragon: React.FC<AnimatedMountainDragonProps> = ({ 
  mood = 'normal',
  size = 100 
}) => {
  // Get the appropriate piece for the current mood
  const getPieceUrl = (piece: keyof typeof MOUNTAIN_DRAGON_PIECES): string => {
    return MOUNTAIN_DRAGON_PIECES[piece][mood] || MOUNTAIN_DRAGON_PIECES[piece].normal;
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
      className="animated-mountain-dragon"
      style={{ 
        width: size, 
        height: size * 1.2, // Maintain aspect ratio
        position: 'relative'
      }}
    >
      <div className="mountain-dragon-container">
        
        {/* Left Leg (back layer) */}
        <motion.img
          src={getPieceUrl('legLeft')}
          alt="Mountain Dragon Left Leg"
          className="mountain-dragon-part mountain-dragon-leg-left"
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
          alt="Mountain Dragon Right Leg"
          className="mountain-dragon-part mountain-dragon-leg-right"
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
          alt="Mountain Dragon Torso"
          className="mountain-dragon-part mountain-dragon-torso"
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
          alt="Mountain Dragon Left Arm"
          className="mountain-dragon-part mountain-dragon-arm-left"
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
          alt="Mountain Dragon Right Arm"
          className="mountain-dragon-part mountain-dragon-arm-right"
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
          alt="Mountain Dragon Head"
          className="mountain-dragon-part mountain-dragon-head"
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
