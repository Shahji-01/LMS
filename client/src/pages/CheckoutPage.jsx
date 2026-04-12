import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../api/services/courseService.js";
import { initiateStripeCheckout, createRazorpayOrder, verifyRazorpayPayment } from "../api/services/purchaseService.js";
import { validateCoupon } from "../api/services/couponService.js";
import toast from "react-hot-toast";
import { ShieldCheck, CreditCard, Clock, MonitorPlay, Tag, Loader2 } from "lucide-react";
import { optimizeImage } from "../utils/optimizeCloudinaryUrl.js";
import { PageLoader } from "../components/SkeletonLoader";
import { motion } from "framer-motion";

const CheckoutPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState("razorpay"); // default to razorpay since stripe isn't integrated with coupons here yet

  const [promoCode, setPromoCode] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const data = await getCourseById(courseId);
        setCourse(data?.data?.course || data?.data || data);
      } catch {
        toast.error("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    try {
      const res = await validateCoupon(promoCode);
      setAppliedCoupon(res.data);
      toast.success(`Promo code applied! ${res.data.discountPercentage}% off.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired promo code.");
      setAppliedCoupon(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const removePromo = () => {
    setAppliedCoupon(null);
    setPromoCode("");
  };

  const handleStripeCheckout = async () => {
    setPaying(true);
    try {
      const data = await initiateStripeCheckout(courseId);
      const checkoutUrl = data?.data?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl; // Stripe hosted page
      } else {
        throw new Error("No checkout URL returned.");
      }
    } catch (err) {
      toast.error(err.message || "Payment failed. Try again.");
      setPaying(false);
    }
  };

  const handleRazorpayCheckout = async () => {
    setPaying(true);
    try {
      const orderData = await createRazorpayOrder(courseId, appliedCoupon?.code);
      const order = orderData?.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: course?.title,
        description: "Course Purchase",
        order_id: order.id,
        handler: async (response) => {
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId,
            });
            toast.success("Payment successful! Welcome to the course.");
            navigate(`/course-progress/${courseId}`);
          } catch {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {},
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => toast.error("Payment failed. Please try again."));
      rzp.open();
    } catch (err) {
      toast.error(err.message || "Failed to initialize payment.");
    } finally {
      setPaying(false);
    }
  };

  const handlePay = () => {
    if (payMethod === "stripe") {
        if (appliedCoupon) {
            toast.error("Coupons are currently only supported via Razorpay.");
            return;
        }
        handleStripeCheckout();
    }
    else handleRazorpayCheckout();
  };

  const coursePrice = course?.price || 0;
  const discountAmount = appliedCoupon ? (coursePrice * appliedCoupon.discountPercentage) / 100 : 0;
  const finalPrice = Math.max(0, coursePrice - discountAmount);

  if (loading) return <PageLoader />;
  if (!course && !loading) return (
    <div className="min-h-[70vh] flex items-center justify-center text-slate-500 font-medium">
      Course not found.
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-slate-50 pt-24 pb-24 px-6"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 tracking-tight">
            Secure Checkout
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Complete your purchase to unlock lifetime access.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Left - Course Info */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {course?.thumbnail ? (
                <div className="relative aspect-video">
                  <img
                    src={optimizeImage(course.thumbnail, 800, null)}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <span className="text-blue-200 font-heading font-bold text-2xl">Course Image</span>
                </div>
              )}

              <div className="p-8">
                <h2 className="text-2xl font-heading font-black text-slate-900 mb-3 leading-tight">
                  {course?.title}
                </h2>
                {course?.subtitle && (
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {course.subtitle}
                  </p>
                )}

                <div className="flex items-center gap-4 pt-6 border-t border-slate-100 mb-8">
                  <img
                    src={course?.instructor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course?.instructor?.name || "I")}&background=2563eb&color=fff`}
                    alt={course?.instructor?.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Instructor</p>
                    <p className="text-[15px] font-bold text-slate-900">{course?.instructor?.name || "Expert Instructor"}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
                  <p className="text-[14px] font-heading font-bold text-slate-900 mb-4">What's included in this purchase:</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <Clock size={16} className="text-blue-500 shrink-0" strokeWidth={2} /> Lifetime Access
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <MonitorPlay size={16} className="text-blue-500 shrink-0" strokeWidth={2} /> High-Quality Videos
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium sm:col-span-2">
                      <ShieldCheck size={16} className="text-blue-500 shrink-0" strokeWidth={2} /> Certificate of Completion
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Checkout Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
              {/* Soft decorative glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-100 rounded-full blur-[80px] pointer-events-none opacity-50" />

              <h3 className="font-heading font-black text-xl text-slate-900 mb-8 relative z-10">Order Summary</h3>

              {/* Promo Code Input */}
              <div className="mb-8 relative z-10">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">Gift or Promo Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Tag size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      disabled={appliedCoupon || validatingPromo}
                      placeholder="Enter code" 
                      className="w-full h-12 pl-10 pr-4 text-sm font-bold font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all disabled:opacity-60 placeholder:normal-case placeholder:font-sans placeholder:font-medium placeholder:text-slate-400" 
                    />
                  </div>
                  {appliedCoupon ? (
                    <button onClick={removePromo} className="h-12 px-5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shrink-0">
                      Remove
                    </button>
                  ) : (
                    <button 
                      onClick={handleApplyPromo} 
                      disabled={!promoCode.trim() || validatingPromo}
                      className="h-12 px-6 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition-colors shrink-0 flex items-center justify-center min-w-[90px]"
                    >
                      {validatingPromo ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-emerald-600 text-[13px] font-bold mt-3 flex items-center gap-1.5 bg-emerald-50 py-2 px-3 rounded-lg border border-emerald-100">
                    <ShieldCheck size={14} /> Coupon applied: {appliedCoupon.discountPercentage}% off!
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-8 relative z-10 child:flex child:items-center child:justify-between child:text-[15px]">
                <div className="text-slate-500 font-medium">
                  <span>Original Price</span>
                  <span className="line-through decoration-slate-300">₹{((coursePrice || 0) * 1.5).toLocaleString('en-IN')}</span>
                </div>
                <div className="text-blue-600 font-semibold">
                  <span>Early Bird Deal</span>
                  <span>-33%</span>
                </div>
                
                <div className="text-slate-900 font-bold pt-4 border-t border-slate-100">
                  <span>Subtotal</span>
                  <span>₹{coursePrice.toLocaleString('en-IN')}</span>
                </div>

                {appliedCoupon && (
                  <div className="text-emerald-600 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-100 mt-2 !-mx-3">
                    <span>Promo ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-200 mb-8 relative z-10 flex items-end justify-between">
                <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Total Price</span>
                <span className="text-[2.5rem] leading-none font-black font-heading text-slate-900 tracking-tight">
                  ₹{finalPrice.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Payment Method Selector */}
              <div className="mb-8 relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayMethod("stripe")}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                      ${payMethod === "stripe"
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }
                    `}
                  >
                    <CreditCard size={20} className={`mb-2 ${payMethod === "stripe" ? "text-blue-600" : "text-slate-400"}`} />
                    <span className="text-sm font-bold">Stripe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMethod("razorpay")}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                      ${payMethod === "razorpay"
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }
                    `}
                  >
                    <svg className={`w-6 h-6 mb-2 ${payMethod === "razorpay" ? "text-blue-600" : "text-slate-400"}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"></path></svg>
                    <span className="text-sm font-bold">Razorpay</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={paying}
                className="btn-primary w-full h-14 text-base shadow-xl shadow-blue-600/20 relative z-10 active:scale-[0.98] transition-transform rounded-xl"
              >
                {paying ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin text-white/80" />
                    <span>Processing securely...</span>
                  </div>
                ) : (
                  `Pay ₹${finalPrice.toLocaleString('en-IN')} & Enroll`
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-slate-400 relative z-10">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>256-Bit TLS Encryption</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
