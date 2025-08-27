import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convertDataToTable, Data, fetchTimetable, Lesson } from '../utils/data';
import { useTimetableContext } from '../contexts';

export const useSearchResults = () => {
    const { searchQuery, selectedCourses } = useTimetableContext();
    const { isLoading, dataUpdatedAt, data } = useQuery<Data>({
        queryKey: ['results', searchQuery],
        staleTime: 1000 * 60 * 45, // 45 perc
        gcTime: 1000 * 60 * 10, // 10 perc
        queryFn: () => fetchTimetable(searchQuery),
        enabled: Boolean(searchQuery),
    });

    const searchResults = useMemo<Lesson[]>(() => {
        if (!data) {
            return [];
        }
        return convertDataToTable(data, selectedCourses) ?? [];
    }, [data, selectedCourses]);

    return {
        searchResults,
        isLoading,
        dataUpdatedAt,
        data,
    };
};
