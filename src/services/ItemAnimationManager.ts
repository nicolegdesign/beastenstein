import React from 'react';

export interface ItemAnimationProps {
  isVisible: boolean;
  onAnimationComplete: () => void;
}

export interface ItemAnimationConfig {
  duration: number;
  imagePath: string;
  altText: string;
  cssClass: string;
}

// Animation configurations for different items
export const ITEM_ANIMATIONS: Record<string, ItemAnimationConfig> = {
  tennisBall: {
    duration: 2500,
    imagePath: './images/items/tennisBall.svg',
    altText: 'Tennis Ball',
    cssClass: 'tennis-ball-animation'
  },
  steak: {
    duration: 1000,
    imagePath: './images/items/steak.svg',
    altText: 'Steak',
    cssClass: 'steak-animation'
  },
  mysteryMeat: {
    duration: 1000,
    imagePath: './images/items/steak.svg',
    altText: 'Mystery Meat',
    cssClass: 'steak-animation'
  },
  fuzzyBall: {
    duration: 2500,
    imagePath: './images/items/tennisBall.svg',
    altText: 'Fuzzy Ball',
    cssClass: 'tennis-ball-animation'
  }
};

/**
 * ItemAnimationManager - Centralized system for managing item effect animations
 */
export class ItemAnimationManager {
  /**
   * Create and manage an item animation in a specific container
   * @param container The DOM element to append the animation to
   * @param animationType The type of animation to create (key from ITEM_ANIMATIONS)
   * @param onComplete Callback when animation completes
   * @returns Cleanup function to remove the animation
   */
  static createAnimation(
    container: HTMLElement | HTMLDivElement,
    animationType: string,
    onComplete?: () => void
  ): () => void {
    const config = ITEM_ANIMATIONS[animationType];
    
    if (!config) {
      console.warn(`Unknown animation type: ${animationType}`);
      onComplete?.();
      return () => {};
    }

    // Create animation element
    const animationElement = document.createElement('div');
    animationElement.className = `item-animation ${config.cssClass}`;
    
    const img = document.createElement('img');
    img.src = config.imagePath;
    img.alt = config.altText;
    animationElement.appendChild(img);
    
    container.appendChild(animationElement);
    
    // Start animation on next frame
    requestAnimationFrame(() => {
      animationElement.classList.add('active');
    });
    
    // Auto-cleanup after duration
    const timeoutId = setTimeout(() => {
      if (animationElement.parentNode) {
        animationElement.remove();
      }
      onComplete?.();
    }, config.duration);
    
    // Return cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (animationElement.parentNode) {
        animationElement.remove();
      }
    };
  }

  /**
   * Create a tennis ball animation (for PLAY button and Fuzzy Ball item)
   */
  static createTennisBallAnimation(
    container: HTMLElement | HTMLDivElement,
    onComplete?: () => void
  ): () => void {
    return this.createAnimation(container, 'tennisBall', onComplete);
  }

  /**
   * Create a steak animation (for FEED button and Mystery Meat item)
   */
  static createSteakAnimation(
    container: HTMLElement | HTMLDivElement,
    onComplete?: () => void
  ): () => void {
    return this.createAnimation(container, 'steak', onComplete);
  }

  /**
   * Get available animation types
   */
  static getAvailableAnimations(): string[] {
    return Object.keys(ITEM_ANIMATIONS);
  }

  /**
   * Check if an animation type is supported
   */
  static isAnimationSupported(animationType: string): boolean {
    return animationType in ITEM_ANIMATIONS;
  }
}

/**
 * React hook for managing item animations
 * @param container Ref to the container element
 * @param isVisible Whether the animation should be visible
 * @param animationType Type of animation to show
 * @param onComplete Callback when animation completes
 */
export function useItemAnimation(
  container: React.RefObject<HTMLElement | HTMLDivElement>,
  isVisible: boolean,
  animationType: string,
  onComplete?: () => void
): void {
  React.useEffect(() => {
    if (!isVisible || !container.current) return;

    const cleanup = ItemAnimationManager.createAnimation(
      container.current,
      animationType,
      onComplete
    );

    return cleanup;
  }, [isVisible, animationType, onComplete, container]);
}
