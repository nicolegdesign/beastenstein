import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCustomBeast } from '../AnimatedCustomBeast/AnimatedCustomBeast';
import { useInventoryContext } from '../../contexts/InventoryContext';
import type { BeastCombatStats } from '../../types/game';
import './Adventure.css';

interface BeastPart {
  id: string;
  name: string;
  imagePath: string;
  type: 'head' | 'torso' | 'armLeft' | 'armRight' | 'legLeft' | 'legRight';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface SoulEssence {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface CustomBeast {
  name: string;
  gender: 'male' | 'female';
  head: BeastPart;
  torso: BeastPart;
  armLeft: BeastPart;
  armRight: BeastPart;
  legLeft: BeastPart;
  legRight: BeastPart;
  soulEssence: SoulEssence;
  colorScheme?: { id: string; name: string; primary: string; secondary: string; accent: string; rarity: string };
}

interface DroppedLoot {
  id: string;
  name: string;
  type: 'part' | 'set';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  imagePath: string;
}

interface AdventureProps {
  currentBeastId: string;
  playerStats: BeastCombatStats & { health: number };
  onClose: () => void;
}

export const Adventure: React.FC<AdventureProps> = ({ currentBeastId, playerStats, onClose }) => {
  const { inventory, setInventory } = useInventoryContext();
  const [gameState, setGameState] = useState<'setup' | 'battle' | 'victory' | 'defeat' | 'loot'>('setup');
  const [playerHealth, setPlayerHealth] = useState(playerStats.health);
  const [opponentHealth, setOpponentHealth] = useState(30); // Level 1 opponent
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [opponent, setOpponent] = useState<CustomBeast | null>(null);
  const [opponentStats] = useState<BeastCombatStats>({
    attack: 5,
    defense: 4,
    speed: 3,
    magic: 2
  });
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [droppedLoot, setDroppedLoot] = useState<DroppedLoot | null>(null);

  // Generate random opponent
  useEffect(() => {
    const generateOpponent = (): CustomBeast => {
      const availableParts = {
        heads: [
          { id: 'nightwolf-head', name: 'Night Wolf Head', imagePath: './images/beasts/night-wolf/night-wolf-head.svg', type: 'head' as const, rarity: 'common' as const },
          { id: 'mountaindragon-head', name: 'Mountain Dragon Head', imagePath: './images/beasts/mountain-dragon/mountain-dragon-head.svg', type: 'head' as const, rarity: 'common' as const }
        ],
        torsos: [
          { id: 'nightwolf-torso', name: 'Night Wolf Torso', imagePath: './images/beasts/night-wolf/night-wolf-torso.svg', type: 'torso' as const, rarity: 'common' as const },
          { id: 'mountaindragon-torso', name: 'Mountain Dragon Torso', imagePath: './images/beasts/mountain-dragon/mountain-dragon-torso.svg', type: 'torso' as const, rarity: 'common' as const }
        ],
        arms: [
          { left: './images/beasts/night-wolf/night-wolf-arm-l.svg', right: './images/beasts/night-wolf/night-wolf-arm-r.svg', name: 'Night Wolf Arms' },
          { left: './images/beasts/mountain-dragon/mountain-dragon-arm-l.svg', right: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg', name: 'Mountain Dragon Arms' }
        ],
        legs: [
          { left: './images/beasts/night-wolf/night-wolf-leg-l.svg', right: './images/beasts/night-wolf/night-wolf-leg-r.svg', name: 'Night Wolf Legs' },
          { left: './images/beasts/mountain-dragon/mountain-dragon-leg-l.svg', right: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg', name: 'Mountain Dragon Legs' }
        ]
      };

      const randomHead = availableParts.heads[Math.floor(Math.random() * availableParts.heads.length)];
      const randomTorso = availableParts.torsos[Math.floor(Math.random() * availableParts.torsos.length)];
      const randomArms = availableParts.arms[Math.floor(Math.random() * availableParts.arms.length)];
      const randomLegs = availableParts.legs[Math.floor(Math.random() * availableParts.legs.length)];

      return {
        name: 'Wild Beast',
        gender: Math.random() < 0.5 ? 'male' : 'female',
        head: randomHead,
        torso: randomTorso,
        armLeft: {
          id: 'opponent-arm-left',
          name: `${randomArms.name} Left`,
          imagePath: randomArms.left,
          type: 'armLeft',
          rarity: 'common'
        },
        armRight: {
          id: 'opponent-arm-right',
          name: `${randomArms.name} Right`,
          imagePath: randomArms.right,
          type: 'armRight',
          rarity: 'common'
        },
        legLeft: {
          id: 'opponent-leg-left',
          name: `${randomLegs.name} Left`,
          imagePath: randomLegs.left,
          type: 'legLeft',
          rarity: 'common'
        },
        legRight: {
          id: 'opponent-leg-right',
          name: `${randomLegs.name} Right`,
          imagePath: randomLegs.right,
          type: 'legRight',
          rarity: 'common'
        },
        soulEssence: {
          id: 'dim-soul',
          name: 'Dim Soul',
          description: 'A faint glimmer of spiritual energy',
          imagePath: './images/items/dim-soul.png',
          rarity: 'common'
        }
      };
    };

    const newOpponent = generateOpponent();
    setOpponent(newOpponent);
    
    // Determine who goes first based on speed
    if (playerStats.speed >= opponentStats.speed) {
      setCurrentTurn('player');
      setBattleLog(['Battle begins! You move first!']);
    } else {
      setCurrentTurn('opponent');
      setBattleLog(['Battle begins! The opponent moves first!']);
    }
    
    setGameState('battle');
  }, [playerStats.speed, opponentStats.speed]);

  const calculateDamage = (attackStat: number, defenseStat: number): number => {
    const baseDamage = Math.max(1, attackStat - Math.floor(defenseStat / 2));
    const variance = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    return Math.max(1, baseDamage + variance);
  };

  // Generate loot drop based on rarity weights
  const generateLoot = (): DroppedLoot => {
    const availableLoot = [
      // Individual parts (head, torso only)
      { id: 'nightwolf-head', name: 'Night Wolf Head', type: 'part' as const, rarity: 'common' as const, imagePath: './images/beasts/night-wolf/night-wolf-head.svg' },
      { id: 'nightwolf-torso', name: 'Night Wolf Torso', type: 'part' as const, rarity: 'common' as const, imagePath: './images/beasts/night-wolf/night-wolf-torso.svg' },
      { id: 'mountaindragon-head', name: 'Mountain Dragon Head', type: 'part' as const, rarity: 'common' as const, imagePath: './images/beasts/mountain-dragon/mountain-dragon-head.svg' },
      { id: 'mountaindragon-torso', name: 'Mountain Dragon Torso', type: 'part' as const, rarity: 'common' as const, imagePath: './images/beasts/mountain-dragon/mountain-dragon-torso.svg' },
      { id: 'forestsprite-head', name: 'Forest Sprite Head', type: 'part' as const, rarity: 'uncommon' as const, imagePath: './images/beasts/forest-sprite/forest-sprite-head.svg' },
      { id: 'forestsprite-torso', name: 'Forest Sprite Torso', type: 'part' as const, rarity: 'uncommon' as const, imagePath: './images/beasts/forest-sprite/forest-sprite-torso.svg' },
      { id: 'shadowbeast-head', name: 'Shadow Beast Head', type: 'part' as const, rarity: 'rare' as const, imagePath: './images/beasts/shadow-beast/shadow-beast-head.svg' },
      { id: 'shadowbeast-torso', name: 'Shadow Beast Torso', type: 'part' as const, rarity: 'rare' as const, imagePath: './images/beasts/shadow-beast/shadow-beast-torso.svg' },
      { id: 'thundereagle-head', name: 'Thunder Eagle Head', type: 'part' as const, rarity: 'epic' as const, imagePath: './images/beasts/thunder-eagle/thunder-eagle-head.svg' },
      { id: 'thundereagle-torso', name: 'Thunder Eagle Torso', type: 'part' as const, rarity: 'epic' as const, imagePath: './images/beasts/thunder-eagle/thunder-eagle-torso.svg' },
      { id: 'frostwolf-head', name: 'Frost Wolf Head', type: 'part' as const, rarity: 'legendary' as const, imagePath: './images/beasts/frost-wolf/frost-wolf-head.svg' },
      { id: 'frostwolf-torso', name: 'Frost Wolf Torso', type: 'part' as const, rarity: 'legendary' as const, imagePath: './images/beasts/frost-wolf/frost-wolf-torso.svg' },
      
      // Arm and leg sets
      { id: 'nightwolf-arms', name: 'Night Wolf Arms', type: 'set' as const, rarity: 'common' as const, imagePath: './images/beasts/night-wolf/night-wolf-arm-r.svg' },
      { id: 'nightwolf-legs', name: 'Night Wolf Legs', type: 'set' as const, rarity: 'common' as const, imagePath: './images/beasts/night-wolf/night-wolf-leg-r.svg' },
      { id: 'mountaindragon-arms', name: 'Mountain Dragon Arms', type: 'set' as const, rarity: 'common' as const, imagePath: './images/beasts/mountain-dragon/mountain-dragon-arm-r.svg' },
      { id: 'mountaindragon-legs', name: 'Mountain Dragon Legs', type: 'set' as const, rarity: 'common' as const, imagePath: './images/beasts/mountain-dragon/mountain-dragon-leg-r.svg' }
    ];

    // Rarity weights (higher = more common)
    const rarityWeights = {
      'common': 50,
      'uncommon': 25,
      'rare': 15,
      'epic': 8,
      'legendary': 2
    };

    // Create weighted array
    const weightedLoot: typeof availableLoot = [];
    availableLoot.forEach(item => {
      const weight = rarityWeights[item.rarity];
      for (let i = 0; i < weight; i++) {
        weightedLoot.push(item);
      }
    });

    // Select random item
    const selectedLoot = weightedLoot[Math.floor(Math.random() * weightedLoot.length)];
    return selectedLoot;
  };

  const playerAttack = () => {
    if (currentTurn !== 'player' || gameState !== 'battle') return;

    const damage = calculateDamage(playerStats.attack, opponentStats.defense);
    const newOpponentHealth = Math.max(0, opponentHealth - damage);
    setOpponentHealth(newOpponentHealth);
    
    setBattleLog(prev => [...prev, `You attack for ${damage} damage!`]);

    if (newOpponentHealth <= 0) {
      setGameState('victory');
      setBattleLog(prev => [...prev, 'Victory! You defeated the wild beast!']);
      
      // Generate loot drop
      const loot = generateLoot();
      setDroppedLoot(loot);
      setBattleLog(prev => [...prev, `The opponent dropped: ${loot.name}!`]);
      
      // Add loot to inventory
      if (loot.type === 'part') {
        setInventory(prev => ({
          ...prev,
          parts: {
            ...prev.parts,
            [loot.id]: (prev.parts[loot.id] || 0) + 1
          }
        }));
      } else if (loot.type === 'set') {
        setInventory(prev => ({
          ...prev,
          sets: {
            ...prev.sets,
            [loot.id]: (prev.sets[loot.id] || 0) + 1
          }
        }));
      }
      
      return;
    }

    setCurrentTurn('opponent');
    
    // Opponent attacks after a delay
    setTimeout(() => {
      opponentAttack();
    }, 1500);
  };

  const opponentAttack = () => {
    const damage = calculateDamage(opponentStats.attack, playerStats.defense);
    const newPlayerHealth = Math.max(0, playerHealth - damage);
    setPlayerHealth(newPlayerHealth);
    
    setBattleLog(prev => [...prev, `The wild beast attacks for ${damage} damage!`]);

    if (newPlayerHealth <= 0) {
      setGameState('defeat');
      setBattleLog(prev => [...prev, 'Defeat! Your beast has fallen...']);
      return;
    }

    setCurrentTurn('player');
  };

  const proceedToLoot = () => {
    setGameState('loot');
  };

  const getPlayerBeast = (): CustomBeast | null => {
    try {
      const customBeastData = localStorage.getItem(`customBeast_${currentBeastId}`);
      if (customBeastData) {
        return JSON.parse(customBeastData);
      }
    } catch (e) {
      console.error('Failed to load player beast:', e);
    }
    return null;
  };

  const playerBeast = getPlayerBeast();

  return (
    <div className="adventure">
      {gameState === 'battle' && (
        <div className="battle-arena">
          {/* Background */}
          <div className="adventure-background">
            <img src="./images/arenas/arena2.jpg" alt="Adventure Arena" className="adventure-bg-image" />
          </div>
          
          {/* Header */}
          <div className="adventure-header">
            <h1>🗺️ Adventure Mode</h1>
          </div>

          {/* Battle Content */}
          <div className="battle-content">
            {/* Player Beast */}
            <div className="beast-container player-beast">
              <div className="beast-info">
                <h3>{playerBeast?.name || 'Your Beast'}</h3>
                <div className="health-bar">
                  <div 
                    className="health-fill player-health" 
                    style={{ width: `${(playerHealth / playerStats.health) * 100}%` }}
                  />
                  <span className="health-text">{playerHealth}/{playerStats.health}</span>
                </div>
                <div className="stats-mini">
                  <span>ATK: {playerStats.attack}</span>
                  <span>DEF: {playerStats.defense}</span>
                  <span>SPD: {playerStats.speed}</span>
                </div>
              </div>
              {playerBeast && (
                <div className="beast-visual">
                  <AnimatedCustomBeast 
                    mood="normal" 
                    size={200}
                    customBeast={playerBeast}
                  />
                </div>
              )}
            </div>

            {/* VS Indicator */}
            <div className="vs-indicator">
              <motion.div
                className="vs-text"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                VS
              </motion.div>
            </div>

            {/* Opponent Beast */}
            <div className="beast-container opponent-beast">
              <div className="beast-info">
                <h3>{opponent?.name || 'Wild Beast'} (Lvl 1)</h3>
                <div className="health-bar">
                  <div 
                    className="health-fill opponent-health" 
                    style={{ width: `${(opponentHealth / 30) * 100}%` }}
                  />
                  <span className="health-text">{opponentHealth}/30</span>
                </div>
                <div className="stats-mini">
                  <span>ATK: {opponentStats.attack}</span>
                  <span>DEF: {opponentStats.defense}</span>
                  <span>SPD: {opponentStats.speed}</span>
                </div>
              </div>
              {opponent && (
                <div className="beast-visual">
                  <AnimatedCustomBeast 
                    mood="normal" 
                    size={200}
                    customBeast={opponent}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Battle Controls */}
          <div className="battle-controls">
            <div className="turn-indicator">
              {currentTurn === 'player' ? "Your Turn!" : "Opponent's Turn..."}
            </div>
            <motion.button
              className={`attack-btn ${currentTurn !== 'player' ? 'disabled' : ''}`}
              onClick={playerAttack}
              disabled={currentTurn !== 'player'}
              whileHover={currentTurn === 'player' ? { scale: 1.05 } : {}}
              whileTap={currentTurn === 'player' ? { scale: 0.95 } : {}}
            >
              ⚔️ Attack
            </motion.button>
          </div>

          {/* Battle Log */}
          <div className="battle-log">
            <h4>Battle Log</h4>
            <div className="log-content">
              {battleLog.map((log, index) => (
                <div key={index} className="log-entry">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Victory/Defeat Screen */}
      {(gameState === 'victory' || gameState === 'defeat') && (
        <div className="battle-result">
          <motion.div
            className={`result-text ${gameState}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {gameState === 'victory' ? '🎉 Victory!' : '💀 Defeat!'}
          </motion.div>
          {gameState === 'victory' ? (
            <motion.button
              className="result-btn"
              onClick={proceedToLoot}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Claim Loot
            </motion.button>
          ) : (
            <motion.button
              className="result-btn"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Return to Beast Den
            </motion.button>
          )}
        </div>
      )}

      {/* Loot Screen */}
      {gameState === 'loot' && droppedLoot && (
        <div className="loot-screen">
          <motion.div
            className="loot-container"
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <h2 className="loot-title">🎁 Loot Acquired!</h2>
            <div className="loot-item">
              <div className={`loot-icon rarity-${droppedLoot.rarity}`}>
                <img 
                  src={droppedLoot.imagePath} 
                  alt={droppedLoot.name}
                  className="loot-image"
                />
              </div>
              <div className="loot-details">
                <h3 className="loot-name">{droppedLoot.name}</h3>
                <span className={`loot-rarity rarity-${droppedLoot.rarity}`}>
                  {droppedLoot.rarity.charAt(0).toUpperCase() + droppedLoot.rarity.slice(1)}
                </span>
                <p className="loot-type">
                  {droppedLoot.type === 'part' ? 'Beast Part' : 'Part Set'}
                </p>
              </div>
            </div>
            <motion.button
              className="loot-continue-btn"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Return to Beast Den
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
