import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convertDataToTable, Data, fetchTimetable, Lesson } from '../utils/data';
import { useTimetableContext } from '../contexts';

export const useSearchResults = () => {
    const { searchQuery, selectedCourses } = useTimetableContext();
    const { isFetching, isError, error, refetch, dataUpdatedAt, data } = useQuery<Data, Error>({
        queryKey: ['results', searchQuery],
        queryFn: () => fetchTimetable(searchQuery),
        enabled: Boolean(searchQuery),
        retry: false, // gyorsan hibát mutatunk, újrapróbálni a felületen lehet
    });

    const searchResults = useMemo<Lesson[]>(() => {
        if (!data) {
            return [];
        }
        return convertDataToTable(data, selectedCourses) ?? [];
    }, [data, selectedCourses]);

    return {
        searchResults,
        isLoading: isFetching,
        isError,
        error,
        refetch,
        dataUpdatedAt,
        data,
    };
};
