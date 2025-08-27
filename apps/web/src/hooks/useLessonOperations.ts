import { toast } from 'react-toastify';
import { Lesson } from '../utils/data';
import { useTimetableContext } from '../contexts';

export const useLessonOperations = () => {
    const { savedLessons, setSavedLessons, editEvent, setEditEvent } = useTimetableContext();

    const handleLessonSave = (data: Lesson) => {
        const existingLesson = savedLessons.find((lesson) => lesson.id === data.id);
        let newLessons;

        if (existingLesson) {
            newLessons = savedLessons.filter((lesson) => lesson.id !== data.id);
            toast.success('Kurzus eltávolítva az órarendből ✨');
        } else {
            newLessons = [...savedLessons, data];
            toast.success('Kurzus hozzáadva a saját órarendhez ✨');
        }

        window.localStorage.setItem('SAVE_TIMETABLE', JSON.stringify(newLessons));
        setSavedLessons(newLessons);
    };

    const handleCalendarClick = (id: number, searchResults: Lesson[]) => {
        const lesson = savedLessons.concat(searchResults).find((lesson) => lesson.id === id) as Lesson;
        handleLessonSave(lesson);
    };

    const handleEventChange = (data: Lesson, toDelete?: boolean): void => {
        if (toDelete) {
            handleLessonSave(data);
        } else {
            const existingLesson = savedLessons.find((lesson) => lesson.id === data.id);

            if (existingLesson) {
                const updatedLesson = {
                    ...existingLesson,
                    ...data,
                    edited: true,
                };

                const updatedLessons = savedLessons.map((lesson) => {
                    if (lesson.id === data.id) {
                        return updatedLesson;
                    }
                    return lesson;
                });

                window.localStorage.setItem('SAVE_TIMETABLE', JSON.stringify(updatedLessons));
                setSavedLessons(updatedLessons);
                toast.success('Kurzus módosítva ✨');
            } else {
                handleLessonSave(data);
            }
        }
    };

    return {
        editEvent,
        setEditEvent,
        handleLessonSave,
        handleCalendarClick,
        handleEventChange,
    };
};
