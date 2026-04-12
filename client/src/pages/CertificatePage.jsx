import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCourseProgress } from "../api/services/progressService";
import { useAuth } from "../context/AuthContext";
import { Download, ArrowLeft, BadgeCheck } from "lucide-react";

const CertificatePage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await getCourseProgress(courseId);
                const data = res.data || res;
                setCourse(data.courseDetails);

                if (!data.isCompleted) {
                    // Redirect if they somehow bypassed it
                    navigate(`/course-progress/${courseId}`);
                }
            } catch (err) {
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, [courseId, navigate]);

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-200 py-10 px-4 print:bg-white print:py-0 print:px-0 flex flex-col items-center">
            
            <div className="w-full max-w-5xl flex justify-between items-center mb-8 print:hidden">
                <Link to={`/course-progress/${courseId}`} className="text-slate-600 hover:text-blue-600 flex items-center gap-2 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-300">
                    <ArrowLeft /> Back to Course
                </Link>
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-md font-bold transition-colors"
                >
                    <Download className="w-5 h-5" /> Save as PDF
                </button>
            </div>

            {/* Certificate Canvas */}
            <div className="bg-white w-full max-w-[1056px] aspect-[1.414/1] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-16 print:shadow-none print:w-screen print:h-screen print:max-w-none border-8 border-double border-slate-900">
                
                {/* Background Pattern Elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-br-full print:bg-blue-500/10 -z-10" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-slate-900/10 rounded-tl-full print:bg-slate-900/10 -z-10" />
                
                {/* Certificate Border */}
                <div className="absolute inset-4 border-2 border-slate-400 pointer-events-none" />

                <div className="flex flex-col items-center text-center max-w-3xl relative z-10 w-full">
                    <BadgeCheck className="w-24 h-24 text-blue-600 mb-6 mx-auto" />
                    
                    <h1 className="text-5xl md:text-6xl font-serif font-black text-slate-900 tracking-widest uppercase mb-4 border-b-2 border-slate-300 pb-4 inline-block px-12">
                        Certificate
                    </h1>
                    <h2 className="text-2xl text-slate-500 font-medium tracking-widest uppercase mb-12">
                        of Completion
                    </h2>

                    <p className="text-lg text-slate-600 mb-4 italic">This certifies that</p>
                    
                    <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 capitalize">
                        {user?.name || "Student"}
                    </h3>

                    <p className="text-lg text-slate-600 mb-8 italic max-w-2xl px-8">
                        has successfully completed the comprehensive program and fulfilled all curriculum requirements for the course
                    </p>

                    <h4 className="text-3xl font-black text-slate-800 leading-tight mb-16">
                        {course?.courseTitle || course?.title || "Course Name"}
                    </h4>

                    {/* Signatures & Footer */}
                    <div className="w-full grid grid-cols-2 gap-20 px-12 items-end mt-auto">
                        <div className="flex flex-col items-center border-t border-slate-400 pt-2">
                            <span className="font-bold text-slate-800 text-lg sm:shrink-0">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}</span>
                            <span className="text-slate-500 text-sm uppercase tracking-widest mt-1">Date Issued</span>
                        </div>
                        <div className="flex flex-col items-center border-t border-slate-400 pt-2">
                            <span className="font-bold text-slate-800 text-lg font-signature">MainProject Instructor</span>
                            <span className="text-slate-500 text-sm uppercase tracking-widest mt-1">Instructor</span>
                        </div>
                    </div>

                    {/* Bottom branding */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 font-bold tracking-widest text-sm uppercase">
                        LearnHub Education
                    </div>
                </div>
            </div>

            {/* Print Styles injection */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { size: landscape; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
                }
            `}} />
        </div>
    );
};

export default CertificatePage;
