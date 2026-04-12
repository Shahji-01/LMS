import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
    fetchPublishedCourses,
    fetchCourseDetails,
    searchCourses,
    setFilter,
    clearFilters,
    clearCurrentCourse,
} from "../Store/Reducers/courseSlice.jsx";

/**
 * useCourses — course catalog state + actions
 */
const useCourses = () => {
    const dispatch = useDispatch();
    const { courses, currentCourse, searchResults, pagination, filters, loading, error } =
        useSelector((s) => s.course);

    const loadPublishedCourses = useCallback(
        (params) => dispatch(fetchPublishedCourses(params)),
        [dispatch]
    );

    const loadCourseDetails = useCallback(
        (courseId) => dispatch(fetchCourseDetails(courseId)),
        [dispatch]
    );

    const search = useCallback(
        (query) => dispatch(searchCourses(query)),
        [dispatch]
    );

    const updateFilter = useCallback(
        (updates) => dispatch(setFilter(updates)),
        [dispatch]
    );

    const resetFilters = useCallback(() => dispatch(clearFilters()), [dispatch]);

    const clearCourse = useCallback(
        () => dispatch(clearCurrentCourse()),
        [dispatch]
    );

    return {
        courses,
        currentCourse,
        searchResults,
        pagination,
        filters,
        loading,
        error,
        loadPublishedCourses,
        loadCourseDetails,
        search,
        updateFilter,
        resetFilters,
        clearCourse,
    };
};

export default useCourses;
