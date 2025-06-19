import { useState, useRef, useCallback } from 'react';
import { StatusBar } from './components/StatusBar/StatusBar';
import { EditableName } from './components/EditableName/EditableName';
import { GameArea } from './components/GameArea/GameArea';
import { ActionButtons } from './components/ActionButtons/ActionButtons';
import { usePetStats } from './hooks/usePetStats';
import { usePetMovement } from './hooks/usePetMovement';
import { usePooManager } from './hooks/usePooManager';
import './App.css';

function App() {
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [petName, setPetName] = useState('Emi');
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  const {
    stats,
    isResting,
    feed,
    play,
    startRest,
    travel,
    cleanup,
    getPetMood
  } = usePetStats();

  const { position } = usePetMovement(isResting, gameAreaRef);
  
  const { poos, cleanupPoo } = usePooManager(isResting, gameAreaRef);

  const handlePooCleanup = useCallback((pooId: string) => {
    cleanupPoo(pooId);
    cleanup(); // Boost happiness for cleaning up
  }, [cleanupPoo, cleanup]);

  const handleTravel = useCallback(() => {
    travel();
    setCurrentBackgroundIndex((prev) => (prev + 1) % 4);
  }, [travel]);

  const createTennisBall = useCallback(() => {
    if (!gameAreaRef.current || isResting) return;

    const gameArea = gameAreaRef.current;
    const tennisBall = document.createElement('div');
    tennisBall.className = 'tennis-ball';
    
    const ballImg = document.createElement('img');
    ballImg.src = './images/tennisBall.svg';
    ballImg.alt = 'Tennis Ball';
    tennisBall.appendChild(ballImg);
    
    gameArea.appendChild(tennisBall);
    
    requestAnimationFrame(() => {
      tennisBall.classList.add('bounce-animation');
    });
    
    setTimeout(() => {
      if (tennisBall.parentNode) {
        tennisBall.remove();
      }
    }, 2500);
  }, [isResting]);

  const handlePlay = useCallback(() => {
    play();
    createTennisBall();
  }, [play, createTennisBall]);

  return (
    <div className="App">
      <h1>My Buddy: <EditableName initialName={petName} onNameChange={setPetName} /></h1>
      
      <div id="stats-container">
        <StatusBar label="Hunger" value={stats.hunger} id="hunger" />
        <StatusBar label="Happiness" value={stats.happiness} id="happiness" />
        <StatusBar label="Energy" value={stats.energy} id="energy" />
      </div>

      <GameArea
        ref={gameAreaRef}
        backgroundIndex={currentBackgroundIndex}
        petMood={getPetMood()}
        isResting={isResting}
        petPosition={position}
        hunger={stats.hunger}
        poos={poos}
        onFeedFromBowl={feed}
        onRestFromBed={startRest}
        onCleanupPoo={handlePooCleanup}
      />

      <ActionButtons
        onFeed={feed}
        onPlay={handlePlay}
        onRest={startRest}
        onTravel={handleTravel}
        isResting={isResting}
      />
    </div>
  );
}

export default App;
