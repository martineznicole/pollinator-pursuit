import { useCallback, useRef, useState } from "react";

type SoundType = "pollinate" | "powerup" | "gameStart" | "gameOver" | "warning" | "newHighScore";

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume: number = 0.3
  ) => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error("Audio playback failed:", e);
    }
  }, [getAudioContext, isMuted]);

  const playSound = useCallback((sound: SoundType) => {
    if (isMuted) return;

    switch (sound) {
      case "pollinate":
        // Pleasant ascending chime
        playTone(523.25, 0.1, "sine", 0.2); // C5
        setTimeout(() => playTone(659.25, 0.1, "sine", 0.2), 50); // E5
        setTimeout(() => playTone(783.99, 0.15, "sine", 0.2), 100); // G5
        break;
        
      case "powerup":
        // Magical power-up sound
        playTone(440, 0.1, "sine", 0.3); // A4
        setTimeout(() => playTone(554.37, 0.1, "sine", 0.3), 80); // C#5
        setTimeout(() => playTone(659.25, 0.1, "sine", 0.3), 160); // E5
        setTimeout(() => playTone(880, 0.2, "sine", 0.3), 240); // A5
        break;
        
      case "gameStart":
        // Exciting start fanfare
        playTone(392, 0.15, "square", 0.2); // G4
        setTimeout(() => playTone(523.25, 0.15, "square", 0.2), 150); // C5
        setTimeout(() => playTone(659.25, 0.2, "square", 0.2), 300); // E5
        setTimeout(() => playTone(783.99, 0.3, "square", 0.25), 450); // G5
        break;
        
      case "gameOver":
        // Descending game over sound
        playTone(523.25, 0.2, "triangle", 0.3); // C5
        setTimeout(() => playTone(392, 0.2, "triangle", 0.25), 200); // G4
        setTimeout(() => playTone(329.63, 0.3, "triangle", 0.2), 400); // E4
        setTimeout(() => playTone(261.63, 0.4, "triangle", 0.15), 600); // C4
        break;
        
      case "warning":
        // Urgent warning beep
        playTone(880, 0.1, "square", 0.2); // A5
        setTimeout(() => playTone(880, 0.1, "square", 0.2), 200);
        break;
        
      case "newHighScore":
        // Celebratory fanfare
        playTone(523.25, 0.15, "sine", 0.3); // C5
        setTimeout(() => playTone(659.25, 0.15, "sine", 0.3), 100); // E5
        setTimeout(() => playTone(783.99, 0.15, "sine", 0.3), 200); // G5
        setTimeout(() => playTone(1046.5, 0.3, "sine", 0.35), 300); // C6
        setTimeout(() => playTone(783.99, 0.1, "sine", 0.25), 500); // G5
        setTimeout(() => playTone(1046.5, 0.4, "sine", 0.3), 600); // C6
        break;
    }
  }, [playTone, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return { playSound, isMuted, toggleMute };
};
