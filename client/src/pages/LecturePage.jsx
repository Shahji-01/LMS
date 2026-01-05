import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const LecturePage = () => {
  const { courseId, lectureId } = useParams();
  const [lecture, setLecture] = useState(null);

  useEffect(() => {
    const fetchLecture = async () => {
      const { data } = await axios.get(`/api/v1/course/c/${courseId}/lectures`);
      setLecture(data.find((lec) => lec._id === lectureId));
    };
    fetchLecture();
  }, [courseId, lectureId]);

  if (!lecture) return <p>Loading lecture...</p>;

  return (
    <div>
      <h2>{lecture.title}</h2>
      <video src={lecture.video} controls width="600" />
      <p>{lecture.description}</p>
    </div>
  );
};

export default LecturePage;
