
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type SoundType = 'word' | 'confetti';

interface SoundContextType {
    isSoundEnabled: boolean;
    toggleSound: () => void;
    playSound: (type: SoundType) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('motissimo-sound');
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    const toggleSound = useCallback(() => {
        setIsSoundEnabled(prev => {
            const uniqueNewVal = !prev;
            localStorage.setItem('motissimo-sound', JSON.stringify(uniqueNewVal));
            return uniqueNewVal;
        });
    }, []);

    const playSound = useCallback((type: SoundType) => {
        if (!isSoundEnabled) return;

        const audio = new Audio(`assets/sounds/${type}.mp3`);
        audio.volume = 1;

        audio.play().catch(e => {
            // Auto-play policies might block this if not triggered by user interaction
            console.warn("Audio play failed", e);
        });
    }, [isSoundEnabled]);

    return (
        <SoundContext.Provider value={{ isSoundEnabled, toggleSound, playSound }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};
