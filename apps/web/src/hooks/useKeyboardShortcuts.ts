import { useCallback, useEffect } from 'react';

interface UseKeyboardShortcutsProps {
    onUndo: () => void;
    onRedo: () => void;
    enabled: boolean;
}

/**
 * Megmondja, hogy a billentyűleütés szövegbevitel közben történt-e.
 * Ilyenkor a böngésző saját visszavonása kell, nem az órarendé
 */
const isTextEntry = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return (
        target.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
    );
};

export const useKeyboardShortcuts = ({ onUndo, onRedo, enabled }: UseKeyboardShortcutsProps) => {
    const handleKeyPress = useCallback<(event: KeyboardEvent) => void>(
        (event) => {
            if (!enabled || isTextEntry(event.target)) return;

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
