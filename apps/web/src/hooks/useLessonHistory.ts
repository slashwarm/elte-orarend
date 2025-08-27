import { useRef, useState, useEffect } from 'react';
import { Lesson } from '../utils/data';
import { useTimetableContext } from '../contexts';

const MAX_HISTORY_LENGTH = 30;

interface LessonHistoryState {
    stack: Lesson[][];
    idx: number;
    undoAction: 'undo' | 'redo' | 'none';
    canUndo: boolean;
    canRedo: boolean;
}

export const useLessonHistory = () => {
    const { savedLessons } = useTimetableContext();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const lessonHistory = useRef<LessonHistoryState>({
        stack: [savedLessons.map((lesson) => ({ ...lesson }) as Lesson)],
        idx: 0,
        undoAction: 'none',
        canUndo: false,
        canRedo: false,
    });

    useEffect(() => {
        if (lessonHistory.current.undoAction !== 'none') {
            lessonHistory.current.undoAction = 'none';
            return;
        }

        const newLessons = savedLessons.map((lesson) => ({ ...lesson }) as Lesson);

        if (lessonHistory.current.idx !== 0) {
            const lastLessons = lessonHistory.current.stack[lessonHistory.current.idx - 1];

            if (JSON.stringify(newLessons) === JSON.stringify(lastLessons)) {
                return;
            }
        }

        while (lessonHistory.current.idx < lessonHistory.current.stack.length) {
            lessonHistory.current.stack.pop();
        }

        lessonHistory.current.stack.push(newLessons);

        while (lessonHistory.current.stack.length > MAX_HISTORY_LENGTH) {
            lessonHistory.current.stack.shift();
        }

        lessonHistory.current.idx = lessonHistory.current.stack.length;

        lessonHistory.current.canUndo = lessonHistory.current.idx > 1;
        lessonHistory.current.canRedo = false;

        setCanUndo(lessonHistory.current.canUndo);
        setCanRedo(lessonHistory.current.canRedo);
    }, [savedLessons]);

    const undo = (): Lesson[] | null => {
        if (!lessonHistory.current.canUndo) {
            return null;
        }

        lessonHistory.current.idx -= 1;
        lessonHistory.current.undoAction = 'undo';

        lessonHistory.current.canUndo = lessonHistory.current.idx > 1;
        lessonHistory.current.canRedo = true;
        setCanUndo(lessonHistory.current.canUndo);
        setCanRedo(lessonHistory.current.canRedo);

        const newLessons = lessonHistory.current.stack[lessonHistory.current.idx - 1];
        return newLessons;
    };

    const redo = (): Lesson[] | null => {
        if (!lessonHistory.current.canRedo) {
            return null;
        }

        lessonHistory.current.idx += 1;
        lessonHistory.current.undoAction = 'redo';

        lessonHistory.current.canRedo = lessonHistory.current.idx !== lessonHistory.current.stack.length;
        lessonHistory.current.canUndo = true;
        setCanRedo(lessonHistory.current.canRedo);
        setCanUndo(lessonHistory.current.canUndo);

        const newLessons = lessonHistory.current.stack[lessonHistory.current.idx - 1];
        return newLessons;
    };

    return {
        canUndo,
        canRedo,
        undo,
        redo,
    };
};
