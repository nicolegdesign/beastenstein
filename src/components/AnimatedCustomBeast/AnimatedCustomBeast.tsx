import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './AnimatedCustomBeast.css';

interface AnimatedCustomBeastProps {
  mood?: 'normal' | 'happy' | 'sad' | 'rest' | 'laying' | 'attack';
  size?: number;
  facing?: 'left' | 'right';
  soundEffectsEnabled?: boolean;
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
  size = 300,
  facing = 'right',
  soundEffectsEnabled = true,
  customBeast
}) => {
  const attackSoundRef = useRef<HTMLAudioElement>(null);

  // Debug facing direction
  useEffect(() => {
    console.log('AnimatedCustomBeast facing:', facing);
  }, [facing]);

  // Debug styles applied
  useEffect(() => {
    console.log('CSS transform being applied:', facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)');
  }, [facing]);

  // Play attack sound when entering attack mode
  useEffect(() => {
    if (mood === 'attack' && attackSoundRef.current && soundEffectsEnabled) {
      attackSoundRef.current.currentTime = 0; // Reset to beginning
      attackSoundRef.current.volume = 0.6; // Set volume to 60%
      attackSoundRef.current.play().catch(error => {
        console.log('Could not play attack sound:', error);
      });
    }
  }, [mood, soundEffectsEnabled]);

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
      case 'attack':
        return 2.5; // Very aggressive and intense
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
      animate={mood === 'attack' ? {
        x: [0, 180, -20, 90, 0], // Extreme leap forward - halfway across screen
        y: [0, -30, 10, -15, 0], // Higher vertical leap for dramatic effect
        rotate: [0, 5, -2, 3, 0], // More pronounced rotation during leap
        scaleX: facing === 'left' ? -1 : 1, // Add facing direction to attack animation
      } : {
        rotate: layingProps.rotate,
        x: layingProps.x,
        y: layingProps.y,
        scaleX: facing === 'left' ? -1 : 1, // Add facing direction to normal animation
        // Add subtle bounce when changing direction
        scaleY: facing === 'left' ? [1, 0.95, 1] : [1, 0.95, 1],
      }}
      transition={mood === 'attack' ? {
        duration: 0.9,
        repeat: 0, // Play once instead of infinitely
        ease: "easeInOut",
        // Faster transition for facing changes during attack
        scaleX: { duration: 0.05, ease: "easeOut" }
      } : {
        ...layingProps.transition,
        // Much faster and smoother transition for facing changes
        scaleX: { duration: 0.05, ease: "easeOut" },
        scaleY: { duration: 0.05, ease: "easeOut" }
      }}
    >
      <div className="custom-beast-container">
        
        {/* Left Leg (back layer) */}
        <motion.img
          src={customBeast.legLeft.imagePath}
          alt="Custom Beast Left Leg"
          className="custom-beast-part custom-beast-leg-left"
          animate={mood === 'attack' ? {
            rotate: [0, -15, 8, -10, 0],
            x: [0, 5, -3, 2, 0],
          } : {
            rotate: [0, 3 * scale, 0, -2 * scale, 0],
          }}
          transition={mood === 'attack' ? {
            duration: 0.8,
            repeat: 0, // Play once
            ease: "easeInOut",
            delay: 0.1
          } : {
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
          animate={mood === 'attack' ? {
            rotate: [0, 10, -8, 12, 0],
            x: [0, -5, 3, -2, 0],
          } : {
            rotate: [0, -2 * scale, 0, 3 * scale, 0],
          }}
          transition={mood === 'attack' ? {
            duration: 0.8,
            repeat: 0, // Play once
            ease: "easeInOut",
            delay: 0.4
          } : {
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.9
          }}
          style={{ 
            transformOrigin: "50% 15%", // Hip connection to torso
            width: '100%',
            height: '100%',
            right: '28%',
            bottom: '-37%',
            zIndex: 6
          }}
        />

        {/* Torso (center layer - main body) */}
        <motion.img
          src={customBeast.torso.imagePath}
          alt="Custom Beast Torso"
          className="custom-beast-part custom-beast-torso"
          animate={mood === 'attack' ? {
            y: [0, -8, 3, -5, 0],
            x: [0, 10, -5, 8, 0], // Forward lunging motion
            scaleY: [1, 1.1, 0.95, 1.05, 1],
            scaleX: [1, 1.05, 0.98, 1.02, 1],
          } : {
            y: [0, -1.5 * scale, 0],
            scaleY: [1, 1 + (0.03 * scale), 1], // Breathing effect
          }}
          transition={mood === 'attack' ? {
            duration: 0.9,
            repeat: 0, // Play once
            ease: "easeInOut"
          } : {
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
          animate={mood === 'attack' ? {
            rotate: [0, -25, 15, -20, 0], // Aggressive swinging
            x: [0, 8, -5, 6, 0],
            y: [0, -3, 2, -2, 0],
          } : {
            rotate: [0, 5 * scale, 0, -3 * scale, 0],
          }}
          transition={mood === 'attack' ? {
            duration: 0.7,
            repeat: 0, // Play once
            ease: "easeInOut",
            delay: 0.05
          } : {
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.1
          }}
          style={{ 
            transformOrigin: "75% 25%", // Shoulder connection
            width: '100%',
            height: '100%',
            left: '20%',
            top: '0%',
            zIndex: 1
          }}
        />

        {/* Right Arm (front layer) */}
        <motion.img
          src={customBeast.armRight.imagePath}
          alt="Custom Beast Right Arm"
          className="custom-beast-part custom-beast-arm-right"
          animate={mood === 'attack' ? {
            rotate: [0, 30, -20, 25, 0], // More dramatic swinging on front arm
            x: [0, -8, 5, -6, 0],
            y: [0, -5, 3, -4, 0],
          } : {
            rotate: [0, -3 * scale, 0, 5 * scale, 0],
          }}
          transition={mood === 'attack' ? {
            duration: 0.7,
            repeat: 0, // Play once
            ease: "easeInOut",
            delay: 0.35 // Offset from left arm for more dynamic feel
          } : {
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6
          }}
          style={{ 
            transformOrigin: "25% 25%", // Shoulder connection
            width: '100%',
            height: '100%',
            right: '-3%',
            top: '0%',
            zIndex: 7
          }}
        />

        {/* Head (top layer) */}
        <motion.img
          src={customBeast.head.imagePath}
          alt="Custom Beast Head"
          className="custom-beast-part custom-beast-head"
          animate={mood === 'attack' ? {
            y: [0, -3, 1, -2, 0], // Much more subtle vertical movement
            x: [0, 4, -2, 3, 0], // Reduced forward motion to stay connected
            rotate: [0, -3, 2, -2, 0], // Gentler head rotation
            scale: [1, 1.02, 0.99, 1.01, 1], // Very subtle scaling
          } : {
            y: [0, -2 * scale, 0],
            rotate: [0, 1.5 * scale, 0, -1.5 * scale, 0],
          }}
          transition={mood === 'attack' ? {
            duration: 0.8,
            repeat: 0, // Play once
            ease: "easeInOut",
            delay: 0.2
          } : {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '100%',
            height: '100%',
            left: '24%',
            top: '-40%',
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

      {/* Attack animation - show impact effects */}
      {mood === 'attack' && (
        <>
          <motion.div
            className="attack-effect-1"
            style={{
              position: 'absolute',
              top: '30%',
              right: '5%',
              fontSize: '20px',
              color: '#FF6B6B',
              fontWeight: 'bold',
              zIndex: 10
            }}
            animate={{
              x: [0, 15, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{
              duration: 0.8,
              repeat: 0, // Play once
              ease: "easeOut",
              delay: 0.2
            }}
          >
            ⚡
          </motion.div>
          <motion.div
            className="attack-effect-2"
            style={{
              position: 'absolute',
              top: '45%',
              right: '0%',
              fontSize: '16px',
              color: '#FFD93D',
              fontWeight: 'bold',
              zIndex: 10
            }}
            animate={{
              x: [0, 20, 0],
              y: [0, -5, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 0.8,
              repeat: 0, // Play once
              ease: "easeOut",
              delay: 0.5
            }}
          >
            💥
          </motion.div>
        </>
      )}

      {/* Attack sound effect */}
      <audio
        ref={attackSoundRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="/sounds/attack-swift-punch.mp3" type="audio/mpeg" />
      </audio>
    </motion.div>
  );
};
