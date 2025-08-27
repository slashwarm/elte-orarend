import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Lesson, Course, SearchData } from '../utils/data';

interface TimetableContextType {
    savedLessons: Lesson[];
    setSavedLessons: (lessons: Lesson[]) => void;
    searchQuery: SearchData | undefined;
    setSearchQuery: (query: SearchData | undefined) => void;
    selectedCourses: Course[] | undefined;
    setSelectedCourses: (courses: Course[] | undefined) => void;
    editEvent: number | null;
    setEditEvent: (id: number | null) => void;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

interface TimetableProviderProps {
    children: ReactNode;
    initialLessons: Lesson[];
}

export const TimetableProvider: React.FC<TimetableProviderProps> = ({ children, initialLessons }) => {
    const [savedLessons, setSavedLessons] = useState<Lesson[]>(initialLessons);
    const [searchQuery, setSearchQuery] = useState<SearchData>();
    const [selectedCourses, setSelectedCourses] = useState<Course[]>();
    const [editEvent, setEditEvent] = useState<number | null>(null);

    const value: TimetableContextType = {
        savedLessons,
        setSavedLessons,
        searchQuery,
        setSearchQuery,
        selectedCourses,
        setSelectedCourses,
        editEvent,
        setEditEvent,
    };

    return <TimetableContext.Provider value={value}>{children}</TimetableContext.Provider>;
};

export const useTimetableContext = () => {
    const context = useContext(TimetableContext);
    if (context === undefined) {
        throw new Error('useTimetableContext must be used within a TimetableProvider');
    }
    return context;
};
