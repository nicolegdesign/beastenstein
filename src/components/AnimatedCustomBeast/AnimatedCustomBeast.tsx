import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedCustomBeast.css';

interface AnimatedCustomBeastProps {
  mood?: 'normal' | 'happy' | 'sad' | 'rest' | 'laying';
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
  size = 25,
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
      case 'laying':
        return 0.2; // Minimal movement while laying down
      default:
        return 1; // Normal idle
    }
  };

  // Get rotation and positioning for laying down
  const getLayingProps = () => {
    if (mood === 'laying') {
      return {
        rotate: 90, // Rotate the entire beast to lay on its side
        x: 50, // Adjust position to center when rotated
        y: 50,
        transition: {
          duration: 1.5,
          ease: "easeInOut" as const
        }
      };
    }
    return {
      rotate: 0,
      x: 0,
      y: 0,
      transition: {
        duration: 1.5,
        ease: "easeInOut" as const
      }
    };
  };

  const scale = getAnimationScale();
  const layingProps = getLayingProps();

  return (
    <motion.div 
      className="animated-custom-beast"
      style={{ 
        width: `${size}px`, // Use px units for absolute sizing
        height: `${size * 1.2}px`, // Maintain aspect ratio with px
        position: 'relative'
      }}
      animate={{
        rotate: layingProps.rotate,
        x: layingProps.x,
        y: layingProps.y
      }}
      transition={layingProps.transition}
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
            width: '100%',
            height: '100%',
            left: '7%',
            bottom: '-37%',
            zIndex: 1
          }}
        />

        {/* Right Leg (front layer) */}
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
            width: '100%',
            height: '100%',
            right: '25%',
            bottom: '-37%',
            zIndex: 6
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
            width: '100%',
            height: '100%',
            left: '0%',
            bottom: '0%',
            zIndex: 4
          }}
        />

        {/* Left Arm (back layer) */}
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
            width: '100%',
            height: '100%',
            left: '22%',
            top: '5%',
            zIndex: 1
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
            width: '100%',
            height: '100%',
            right: '-7%',
            top: '5%',
            zIndex: 7
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
            width: '100%',
            height: '100%',
            left: '22%',
            top: '-34%',
            zIndex: 5
          }}
        />

      </div>
      
      {/* Sleep animation - show Z's when laying down */}
      {mood === 'laying' && (
        <motion.div
          className="sleep-animation"
          style={{
            position: 'absolute',
            top: '10%',
            right: '15%',
            fontSize: '24px',
            color: '#87CEEB',
            fontWeight: 'bold',
            zIndex: 10
          }}
          animate={{
            y: [-5, -15, -5],
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Z z z
        </motion.div>
      )}
    </motion.div>
  );
};
