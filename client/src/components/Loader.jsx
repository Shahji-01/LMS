import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      {/* Spinner */}
      <div className="h-10 w-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />

      {/* Text */}
      <p className="mt-4 text-sm text-gray-600">
        {text}
      </p>
    </div>
  );
};

export default Loader;
