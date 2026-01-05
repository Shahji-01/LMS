import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MOCK_COURSE = {
  title: "Full Stack Web Development",
  price: 1999,
  thumbnail:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
};

const CheckoutPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      alert("Payment successful! You are now enrolled.");
      navigate(`/courses/${courseId}/status`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left - Course Info */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <img
            src={MOCK_COURSE.thumbnail}
            alt={MOCK_COURSE.title}
            className="h-64 w-full object-cover"
          />

          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-2">
              {MOCK_COURSE.title}
            </h2>
            <p className="text-gray-600">
              Get lifetime access to this course and start learning today.
            </p>
          </div>
        </div>

        {/* Right - Checkout Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4">
            Order Summary
          </h3>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>Course Price</span>
            <span>₹{MOCK_COURSE.price}</span>
          </div>

          <div className="flex items-center justify-between font-semibold text-lg mb-6">
            <span>Total</span>
            <span>₹{MOCK_COURSE.price}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-black text-white font-medium
                       hover:bg-black/90 transition disabled:opacity-60"
          >
            {loading ? "Processing Payment..." : "Pay & Enroll"}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment • Instant access after purchase
          </p>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
