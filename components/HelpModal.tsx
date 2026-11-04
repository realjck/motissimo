import React, { useEffect, useRef, useState } from 'react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (letter: string) => void;
    validChars: Set<string>;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onConfirm, validChars }) => {
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            // Timeout ensures the render is complete and the browser is ready to accept focus
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        if (!val) return;

        const char = val.slice(-1).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Check if it's a valid letter
        if (!char.match(/[A-Z]/)) {
            e.target.value = '';
            return;
        }

        if (validChars.has(char)) {
            onConfirm(char);
            e.target.value = ''; // Clean up for next time
        } else {
            setError(`Aucune case ne contient la lettre ${char}`);
            e.target.value = '';
            // Re-focus to allow trying again immediately
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative transform transition-all scale-100"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center space-y-4">
                    <div className="mx-auto text-4xl w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                        💡
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                        Besoin d'aide ?
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300">
                        Vous êtes bloqué ? Tapez une lettre qui sera révélée instantanément dans toute la grille.
                    </p>

                    <div className="py-4">
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-16 h-16 text-center text-3xl font-black border-2 border-blue-500 rounded-xl bg-slate-50 dark:bg-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:outline-none uppercase caret-transparent"
                            maxLength={1}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onBlur={() => {
                                // Keep focus if user clicks inside modal but not on input (optional, but good for mobile)
                                // Actually better not to force it aggressively to allow clicking 'X'
                            }}
                            autoComplete="off"
                        />
                        {error && (
                            <div className="mt-4 text-red-500 font-medium animate-bounce text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
