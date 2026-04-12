import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
    fetchCourseProgress,
    updateLectureProgress,
    clearProgress,
} from "../Store/Reducers/progressSlice.jsx";

/**
 * useProgress — course progress state per courseId
 * @param {string} courseId — optional, if provided returns progress for that course
 */
const useProgress = (courseId) => {
    const dispatch = useDispatch();
    const { progressMap, loading, error } = useSelector((s) => s.progress);

    const progress = courseId ? progressMap[courseId] ?? null : null;

    const loadProgress = useCallback(
        (cId) => dispatch(fetchCourseProgress(cId || courseId)),
        [dispatch, courseId]
    );

    const markLectureComplete = useCallback(
        (lectureId) =>
            dispatch(updateLectureProgress({ courseId, lectureId })),
        [dispatch, courseId]
    );

    const clearAllProgress = useCallback(
        () => dispatch(clearProgress()),
        [dispatch]
    );

    // Helper: is a specific lecture completed?
    const isLectureCompleted = useCallback(
        (lectureId) =>
            progress?.completedLectures?.some(
                (l) => (l._id || l) === lectureId
            ) ?? false,
        [progress]
    );

    return {
        progress,
        progressMap,
        loading,
        error,
        loadProgress,
        markLectureComplete,
        clearAllProgress,
        isLectureCompleted,
        percentage: progress?.progressPercentage ?? 0,
        isCompleted: (progress?.progressPercentage ?? 0) >= 100,
    };
};

export default useProgress;
