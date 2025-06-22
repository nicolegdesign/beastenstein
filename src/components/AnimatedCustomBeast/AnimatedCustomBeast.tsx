import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedCustomBeast.css';

interface AnimatedCustomBeastProps {
  mood?: 'normal' | 'happy' | 'sad' | 'rest';
  size?: number;
  customBeast: {
    name: string;
    head: { imagePath: string };
    torso: { imagePath: string };
    armLeft: { imagePath: string };
    armRight: { imagePath: string };
    legLeft: { imagePath: string };
    legRight: { imagePath: string };
  };
}

export const AnimatedCustomBeast: React.FC<AnimatedCustomBeastProps> = ({ 
  mood = 'normal',
  size = 100,
  customBeast
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
      className="animated-custom-beast"
      style={{ 
        width: size, 
        height: size * 1.2, // Maintain aspect ratio
        position: 'relative'
      }}
    >
      <div className="custom-beast-container">
        
        {/* Left Leg (back layer) */}
        <motion.img
          src={customBeast.legLeft.imagePath}
          alt="Custom Beast Left Leg"
          className="custom-beast-part custom-beast-leg-left"
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
          src={customBeast.legRight.imagePath}
          alt="Custom Beast Right Leg"
          className="custom-beast-part custom-beast-leg-right"
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
          src={customBeast.torso.imagePath}
          alt="Custom Beast Torso"
          className="custom-beast-part custom-beast-torso"
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
          src={customBeast.armLeft.imagePath}
          alt="Custom Beast Left Arm"
          className="custom-beast-part custom-beast-arm-left"
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
          src={customBeast.armRight.imagePath}
          alt="Custom Beast Right Arm"
          className="custom-beast-part custom-beast-arm-right"
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
          src={customBeast.head.imagePath}
          alt="Custom Beast Head"
          className="custom-beast-part custom-beast-head"
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
