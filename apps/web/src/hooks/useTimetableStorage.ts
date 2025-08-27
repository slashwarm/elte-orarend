import { useMemo } from 'react';
import { Lesson, generateUniqueId } from '../utils/data';
import { decodeLessonsFromSearchParam } from '../utils/encoder';

const readStoredTimetable = (storageTimetable: string) => {
    let save = false;
    const timetable: Lesson[] = JSON.parse(storageTimetable);
    const updatedTimetable = timetable.map((lesson) => {
        if (!lesson.newId) {
            save = true;
            return {
                ...lesson,
                newId: true,
                id: generateUniqueId({
                    name: lesson.name,
                    code: lesson.code,
                    day: lesson.day,
                    time: lesson.time,
                    location: lesson.location,
                    type: lesson.type,
                    course: lesson.course,
                    teacher: lesson.teacher,
                    comment: lesson.comment,
                }),
            };
        }
        return lesson;
    });

    if (save) {
        window.localStorage.setItem('SAVE_TIMETABLE', JSON.stringify(updatedTimetable));
    }

    return updatedTimetable;
};

export const useTimetableStorage = () => {
    const url = new URL(window.location.toString());
    const lessonsUrlParam = url.searchParams.get('lessons');
    const savedTimetable = window.localStorage.getItem('SAVE_TIMETABLE');

    const storageTimetable = useMemo(
        () => (savedTimetable ? readStoredTimetable(savedTimetable) : null),
        [savedTimetable],
    );

    const urlTimetable = useMemo(
        () => (lessonsUrlParam ? decodeLessonsFromSearchParam(lessonsUrlParam) : null),
        [lessonsUrlParam],
    );

    const timetable = urlTimetable ?? storageTimetable ?? [];
    const viewOnly = urlTimetable !== null;

    return {
        timetable,
        viewOnly,
        urlTimetable,
    };
};
