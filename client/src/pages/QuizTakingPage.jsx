import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourseQuizzes, submitQuiz } from "../api/services/quizService";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle, XCircle, FileText } from "lucide-react";

const QuizTakingPage = () => {
    const { courseId, quizId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [submission, setSubmission] = useState(null); // Previous or new submission
    const [answers, setAnswers] = useState([]); // Array of option indices
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await getCourseQuizzes(courseId);
                const { quizzes, submissions } = res.data || res;
                
                const currentQuiz = quizzes.find(q => q._id === quizId);
                if (currentQuiz) {
                    setQuiz(currentQuiz);
                    setAnswers(new Array(currentQuiz.questions.length).fill(null));
                    
                    const existingSub = submissions.find(s => s.quiz === quizId);
                    if (existingSub) {
                        setSubmission(existingSub);
                    }
                }
            } catch {
                toast.error("Failed to load quiz.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [courseId, quizId]);

    const handleOptionSelect = (qIndex, oIndex) => {
        const newAns = [...answers];
        newAns[qIndex] = oIndex;
        setAnswers(newAns);
    };

    const handleSubmit = async () => {
        if (answers.includes(null)) {
            return toast.error("Please answer all questions before submitting.");
        }
        
        if (!window.confirm("Submit your answers?")) return;

        setSubmitting(true);
        try {
            const res = await submitQuiz(quizId, answers);
            setSubmission(res.data.submission);
            if (res.data.passed) {
                toast.success(`You passed with ${res.data.score}%!`);
            } else {
                toast.error(`You scored ${res.data.score}%. Minimum to pass is ${quiz.passingScore}%. Try again!`);
            }
        } catch (err) {
            toast.error("Error submitting quiz.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center pt-20">Loading...</div>;
    if (!quiz) return <div className="min-h-screen bg-slate-50 flex justify-center pt-20">Quiz not found.</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                <Link to={`/course-progress/${courseId}`} className="text-slate-500 hover:text-blue-600 font-medium flex items-center gap-2 mb-4 bg-white px-4 py-2 rounded-lg self-start shadow-sm border border-slate-200">
                    <ArrowLeft /> Back to Course
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">{quiz.title}</h1>
                            {quiz.description && <p className="text-slate-500 mt-1">{quiz.description}</p>}
                        </div>
                    </div>
                    <div className="flex gap-4 border-t border-slate-100 mt-6 pt-4">
                        <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 tracking-wide">
                            {quiz.questions.length} Questions
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold text-blue-700 tracking-wide">
                            Passing Score: {quiz.passingScore}%
                        </div>
                    </div>
                </div>

                {submission ? (
                    <div className={`rounded-2xl shadow-sm border p-8 flex flex-col items-center text-center ${submission.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        {submission.passed ? (
                            <CheckCircle className="w-20 h-20 text-emerald-500 mb-4" />
                        ) : (
                            <XCircle className="w-20 h-20 text-red-500 mb-4" />
                        )}
                        <h2 className={`text-3xl font-black mb-2 ${submission.passed ? 'text-emerald-700' : 'text-red-700'}`}>
                            {submission.score}%
                        </h2>
                        <h3 className={`text-xl font-bold mb-6 ${submission.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                            {submission.passed ? "Congratulations, you passed!" : "You did not pass."}
                        </h3>
                        <div className="flex gap-4">
                            <button onClick={() => { setSubmission(null); setAnswers(new Array(quiz.questions.length).fill(null)); }} className="font-semibold px-6 py-2.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition">
                                Retake Quiz
                            </button>
                            <Link to={`/course-progress/${courseId}`} className="font-bold px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition">
                                Continue Course
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {quiz.questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex gap-3">
                                    <span className="text-blue-500 font-black">{qIndex + 1}.</span> {q.questionText}
                                </h3>
                                <div className="space-y-3">
                                    {q.options.map((opt, oIndex) => {
                                        const isSelected = answers[qIndex] === oIndex;
                                        return (
                                            <button
                                                key={oIndex}
                                                onClick={() => handleOptionSelect(qIndex, oIndex)}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-100 hover:border-slate-300 bg-slate-50 text-slate-700'}`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex justify-between items-center">
                            <p className="text-slate-500 font-medium">Ready to submit?</p>
                            <button 
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "Submit Answers"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizTakingPage;
