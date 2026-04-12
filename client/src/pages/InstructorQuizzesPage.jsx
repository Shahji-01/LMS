import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourseQuizzes, createQuiz, deleteQuiz } from "../api/services/quizService";
import { getCourseById } from "../api/services/courseService";
import toast from "react-hot-toast";
import { Plus, Trash2, ArrowLeft, FileText } from "lucide-react";

const InstructorQuizzesPage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [passingScore, setPassingScore] = useState(50);
    const [questions, setQuestions] = useState([{ questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 }]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [cRes, qRes] = await Promise.all([
                    getCourseById(courseId),
                    getCourseQuizzes(courseId)
                ]);
                setCourse(cRes.data?.course || cRes.data || cRes);
                setQuizzes(qRes.data?.quizzes || []);
            } catch {
                toast.error("Failed to load quizzes");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [courseId]);

    const handleAddQuestion = () => {
        setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 }]);
    };

    const handleQuestionChange = (qIndex, field, value) => {
        const newQs = [...questions];
        newQs[qIndex][field] = value;
        setQuestions(newQs);
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        const newQs = [...questions];
        newQs[qIndex].options[optIndex] = value;
        setQuestions(newQs);
    };

    const handleRemoveQuestion = (qIndex) => {
        const newQs = questions.filter((_, i) => i !== qIndex);
        setQuestions(newQs);
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!title.trim()) return toast.error("Quiz title is required");
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].questionText.trim()) return toast.error(`Question ${i+1} text missing`);
            if (questions[i].options.some(o => !o.trim())) return toast.error(`Question ${i+1} has empty options`);
        }

        setSubmitting(true);
        try {
            const payload = { title, description, passingScore: Number(passingScore), questions };
            const res = await createQuiz(courseId, payload);
            setQuizzes([...quizzes, res.data]);
            toast.success("Quiz created!");
            
            // Reset form
            setShowForm(false);
            setTitle("");
            setDescription("");
            setPassingScore(50);
            setQuestions([{ questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 }]);
        } catch (err) {
            toast.error(err.response?.data?.error?.message || "Failed to create quiz");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        if (!window.confirm("Delete this quiz? It will erase all student submissions.")) return;
        try {
            await deleteQuiz(quizId);
            setQuizzes(quizzes.filter(q => q._id !== quizId));
            toast.success("Quiz deleted");
        } catch {
            toast.error("Failed to delete quiz");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link to={`/instructor/course/${courseId}/edit`} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Manage Quizzes</h1>
                    <p className="text-slate-500 font-medium">{course?.title}</p>
                </div>
            </div>

            {!showForm ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Existing Quizzes ({quizzes.length})</h2>
                        <button onClick={() => setShowForm(true)} className="btn-primary gap-2">
                            <Plus /> Create New Quiz
                        </button>
                    </div>

                    {quizzes.length === 0 ? (
                        <div className="card p-12 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex justify-center items-center text-slate-400 mb-4">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">No quizzes yet</h3>
                            <p className="text-slate-500 max-w-sm mt-2">Test your students' knowledge by adding multiple choice quizzes to your curriculum.</p>
                            <button onClick={() => setShowForm(true)} className="btn-outline mt-6">Create Quiz</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {quizzes.map((quiz, i) => (
                                <div key={quiz._id} className="card p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-slate-900 line-clamp-2">{i+1}. {quiz.title}</h3>
                                            <button onClick={() => handleDeleteQuiz(quiz._id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Delete Quiz">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-indigo-600">{quiz.questions.length} Questions</span>
                                        <span className="text-emerald-600">Pass: {quiz.passingScore}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="card p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                        <h2 className="text-2xl font-black text-slate-900">Create New Quiz</h2>
                        <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-900 font-bold">Cancel</button>
                    </div>

                    <form onSubmit={handleCreateQuiz} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Quiz Title *</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. React Fundamentals" className="input-text w-full" required maxLength={150} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Passing Score (%) *</label>
                                <input type="number" value={passingScore} onChange={e => setPassingScore(e.target.value)} min="0" max="100" className="input-text w-full" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What will this quiz cover?" className="input-text w-full min-h-[80px]" maxLength={500} />
                        </div>

                        <div className="border-t border-slate-200 pt-8 space-y-8">
                            <h3 className="text-xl font-bold text-slate-900">Questions</h3>
                            
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                                    <div className="absolute top-4 right-4 space-x-2">
                                        <button type="button" onClick={() => handleRemoveQuestion(qIndex)} disabled={questions.length === 1} className="text-red-400 hover:text-red-600 disabled:opacity-30 p-2">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Question {qIndex + 1}</label>
                                    <input type="text" value={q.questionText} onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)} className="input-text w-full mb-4 bg-white" placeholder="What is..." required />
                                    
                                    <p className="text-sm font-bold text-slate-700 mb-3 mt-6 border-b border-slate-200 pb-2">Options (Select Correct Answer)</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
                                                <input type="radio" name={`correctOption-${qIndex}`} checked={q.correctOptionIndex === oIndex} onChange={() => handleQuestionChange(qIndex, 'correctOptionIndex', oIndex)} className="w-5 h-5 text-blue-600 ml-2" />
                                                <input type="text" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} className="w-full text-sm p-2 outline-none" placeholder={`Option ${oIndex + 1}`} required />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button type="button" onClick={handleAddQuestion} className="btn-outline w-full gap-2 border-dashed border-2 hover:border-solid">
                                <Plus /> Add Another Question
                            </button>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-slate-200 mt-8">
                            <button type="submit" disabled={submitting} className="btn-primary w-full md:w-auto px-10 h-14 shadow-lg">
                                {submitting ? "Creating Quiz..." : "Create Quiz"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default InstructorQuizzesPage;
