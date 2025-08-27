import { toast } from 'react-toastify';
import { Lesson } from './data';
import { encodeLessonsToSearchParam } from './encoder';

export const handleUrlExport = async (savedLessons: Lesson[]) => {
    const url = new URL(window.location.toString());

    url.searchParams.delete('lessons');
    url.searchParams.append('lessons', encodeLessonsToSearchParam(savedLessons));

    await navigator.clipboard.writeText(url.toString());

    toast.success('URL kimásolva a vágólapra ✨');
};
