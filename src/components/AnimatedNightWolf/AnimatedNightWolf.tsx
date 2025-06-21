import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedNightWolf.css';

interface AnimatedNightWolfProps {
  mood?: 'normal' | 'happy' | 'sad' | 'rest';
  size?: number;
}

export const AnimatedNightWolf: React.FC<AnimatedNightWolfProps> = ({ 
  mood = 'normal',
  size = 100 
}) => {
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
          src="/images/beasts/night-wolf/night-wolf-leg-l.svg"
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
          src="/images/beasts/night-wolf/night-wolf-leg-r.svg"
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
          src="/images/beasts/night-wolf/night-wolf-torso.svg"
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
          src="/images/beasts/night-wolf/night-wolf-arm-l.svg"
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
          src="/images/beasts/night-wolf/night-wolf-arm-r.svg"
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
          src="/images/beasts/night-wolf/night-wolf-head.svg"
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
            width: '48%',
            height: '42%',
            left: '10%',
            top: '6%',
            zIndex: 5
          }}
        />

      </div>
    </div>
  );
};