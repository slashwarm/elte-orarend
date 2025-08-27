import { useCallback, useEffect } from 'react';

interface UseKeyboardShortcutsProps {
    onUndo: () => void;
    onRedo: () => void;
    enabled: boolean;
}

export const useKeyboardShortcuts = ({ onUndo, onRedo, enabled }: UseKeyboardShortcutsProps) => {
    const handleKeyPress = useCallback<(event: KeyboardEvent) => void>(
        (event) => {
            if (!enabled) return;

            if (event.ctrlKey && event.key.toLowerCase() === 'z') {
                onUndo();
            } else if (event.ctrlKey && event.key.toLowerCase() === 'y') {
                onRedo();
            }
        },
        [onUndo, onRedo, enabled],
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);
};
