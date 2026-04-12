import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCourseLectures } from "../api/services/courseService.js";
import { updateLectureProgress } from "../api/services/progressService.js";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle, Play, Menu } from "lucide-react";
import DiscussionSection from "../components/DiscussionSection";
import NoteSection from "../components/NoteSection";

const LecturePage = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("discussions"); // "discussions" | "notes"
  const videoRef = React.useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCourseLectures(courseId);
        const list = data?.data?.lectures || data?.lectures || [];
        setLectures(list);
        const lec = list.find((l) => l._id === lectureId) || list[0];
        setCurrentLecture(lec);
      } catch {
        toast.error("Failed to load lecture.");
        setError("Failed to load lecture.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, lectureId]);

  useEffect(() => {
    if (lectures.length > 0) {
      const lec = lectures.find((l) => l._id === lectureId);
      if (lec) setCurrentLecture(lec);
    }
  }, [lectureId, lectures]);

  const handleMarkComplete = async () => {
    if (!currentLecture) return;
    setMarking(true);
    try {
      await updateLectureProgress(courseId, currentLecture._id, true);
      toast.success("Lecture marked as complete!");
      // Move to next lecture
      const currentIdx = lectures.findIndex((l) => l._id === currentLecture._id);
      if (currentIdx < lectures.length - 1) {
        const next = lectures[currentIdx + 1];
        navigate(`/course-progress/${courseId}/lecture/${next._id}`);
      } else {
        toast.success("Course complete! 🎉");
        navigate(`/course-progress/${courseId}`);
      }
    } catch {
      toast.error("Failed to update progress.");
    } finally {
      setMarking(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
      <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin mb-4" />
      <p>Loading lecture...</p>
    </div>
  );

  if (error || !currentLecture) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
      <div className="text-center">
        <p className="text-xl text-slate-300 mb-4">{error || "Lecture not found."}</p>
        <Link to={`/course-progress/${courseId}`} className="text-blue-500 hover:text-blue-400">Return to Course Details</Link>
      </div>
    </div>
  );

  const currentIdx = lectures.findIndex((l) => l._id === currentLecture._id);
  const prevLecture = currentIdx > 0 ? lectures[currentIdx - 1] : null;
  const nextLecture = currentIdx < lectures.length - 1 ? lectures[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col lg:flex-row font-sans selection:bg-blue-500/30">

      {/* Mobile Header / Sidebar Toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-white/5">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:text-white transition">
          <Menu className="w-6 h-6" />
        </button>
        <Link to={`/course-progress/${courseId}`} className="text-sm font-medium text-slate-400 hover:text-white transition flex items-center gap-2">
          Back to Course
        </Link>
      </div>

      {/* Sidebar — lecture list */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 
        flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-white/5 hidden lg:block">
          <Link to={`/course-progress/${courseId}`} className="text-sm font-medium text-slate-400 hover:text-white transition flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Course Progress
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 pb-2">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Course Curriculum</h2>
          </div>
          <ul className="pb-8">
            {lectures.map((lec, idx) => {
              const isActive = lec._id === currentLecture._id;
              // Assuming we don't have real-time completed status here unless we fetch it, 
              // but we'll highlight the active one beautifully.
              return (
                <li key={lec._id}>
                  <Link
                    to={`/course-progress/${courseId}/lecture/${lec._id}`}
                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                    className={`
                      flex items-start gap-3 p-4 transition-all duration-200 border-l-2
                      ${isActive
                        ? "bg-blue-500/10 border-blue-500"
                        : "border-transparent hover:bg-slate-800/50 hover:border-slate-700"}
                    `}
                  >
                    <div className={`mt-0.5 shrink-0 ${isActive ? "text-blue-500" : "text-slate-500"}`}>
                      {isActive ? <Play fill="currentColor" className="w-5 h-5 fill-blue-500/20" /> : <span className="text-xs font-medium w-5 inline-block text-center">{idx + 1}</span>}
                    </div>

                    <span className={`text-sm leading-relaxed ${isActive ? "text-white font-medium" : "text-slate-400"}`}>
                      {lec.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main — video player & content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-slate-950">

        {/* Video Container */}
        <div className="w-full bg-black aspect-video relative group border-b border-white/10">
          {currentLecture.videoUrl ? (
            <video
              ref={videoRef}
              key={currentLecture._id}
              src={currentLecture.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black outline-none"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900 border-b border-white/5">
              <Play className="w-16 h-16 opacity-20 mb-4" />
              <p>No video available for this lecture.</p>
            </div>
          )}
        </div>

        {/* Lecture info */}
        <div className="flex-1 p-6 md:p-10 lg:p-12 max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3 tracking-tight">
                {currentLecture.title}
              </h1>
              {currentLecture.description && (
                <p className="text-slate-400 leading-relaxed max-w-3xl text-sm md:text-base">
                  {currentLecture.description}
                </p>
              )}
            </div>

            {/* Action Button Desktop */}
            <div className="hidden md:block shrink-0">
              <button
                onClick={handleMarkComplete}
                disabled={marking}
                className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {marking ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <CheckCircle fill="currentColor" className="w-5 h-5 flex-shrink-0" />
                )}
                Mark Complete
              </button>
            </div>
          </div>

          <hr className="border-white/10 my-8 hidden md:block" />

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 md:mt-0">
            {prevLecture ? (
              <Link
                to={`/course-progress/${courseId}/lecture/${prevLecture._id}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Previous Lecture
              </Link>
            ) : <div className="hidden sm:block" />}

            {/* Action Button Mobile */}
            <button
              onClick={handleMarkComplete}
              disabled={marking}
              className="w-full sm:hidden h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {marking ? "Processing..." : <><CheckCircle fill="currentColor" className="w-5 h-5" /> Mark Complete</>}
            </button>

            {nextLecture && (
              <Link
                to={`/course-progress/${courseId}/lecture/${nextLecture._id}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center justify-center gap-2 group"
              >
                Next Lecture <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          <hr className="border-white/10 my-10 hidden md:block" />

          {/* Engagement Tabs */}
          <div className="mt-8 md:mt-12">
            <div className="flex gap-8 mb-8 border-b border-white/5 pb-0">
              <button 
                onClick={() => setActiveTab("discussions")} 
                className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "discussions" ? "text-blue-500 border-blue-500" : "text-slate-500 border-transparent hover:text-slate-300"}`}
              >
                Q&A Discussions
              </button>
              <button 
                onClick={() => setActiveTab("notes")} 
                className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "notes" ? "text-yellow-500 border-yellow-500" : "text-slate-500 border-transparent hover:text-slate-300"}`}
              >
                My Private Notes
              </button>
            </div>

            {/* Tab Contents */}
            <div className="animate-in fade-in duration-300">
              {activeTab === "discussions" && <DiscussionSection courseId={courseId} lectureId={currentLecture._id} />}
              {activeTab === "notes" && (
                <NoteSection 
                  lectureId={currentLecture._id} 
                  getCurrentTime={() => videoRef.current ? videoRef.current.currentTime : 0} 
                  onSeek={(time) => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = time;
                      videoRef.current.play();
                    }
                  }} 
                />
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default LecturePage;
