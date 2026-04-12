import React, { useState, useEffect, useRef } from "react";
import { getProfile, updateProfile } from "../api/services/userService.js";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import { Camera, Pencil, X, Save } from "lucide-react";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "", bio: "", avatar: "" });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    getProfile()
      .then((data) => {
        const u = data?.data || data;
        setProfile({ name: u.name || "", email: u.email || "", bio: u.bio || "", avatar: u.avatar || "" });
      })
      .catch(() => toast.error("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("bio", profile.bio);
      if (avatarFile) formData.append("avatar", avatarFile);
      const res = await updateProfile(formData);
      const updated = res?.data || res;
      setProfile({ name: updated.name || "", email: updated.email || "", bio: updated.bio || "", avatar: updated.avatar || "" });
      toast.success("Profile updated successfully!");
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = avatarPreview || (profile.avatar && profile.avatar !== "default-avatar.png" ? profile.avatar : null);

  const AvatarDisplay = ({ size = "md", editable = false }) => {
    const sizeClass = size === "lg" ? "w-24 h-24 text-3xl" : "w-20 h-20 text-2xl";
    return (
      <div
        className={`relative rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-black font-heading text-blue-600 border-4 border-white shadow-lg ${sizeClass} ${editable ? "cursor-pointer" : ""}`}
        onClick={editable ? () => fileRef.current?.click() : undefined}
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span>{profile.name?.charAt(0)?.toUpperCase() || "U"}</span>
        )}
        {editable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Camera size={22} className="text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and preferences."
        action={
          !loading && !editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
              <Pencil size={15} /> Edit Profile
            </button>
          ) : null
        }
      />

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-sm flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-blue-600 animate-spin-smooth" />
        </div>
      ) : editing ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
        >
          <form onSubmit={handleSave} className="space-y-8">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
              <AvatarDisplay editable />
              <div>
                <h3 className="font-bold font-heading text-slate-900 mb-1">Profile Picture</h3>
                <p className="text-sm text-slate-500 mb-3">PNG, JPG or WEBP. Max 5MB.</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn-secondary text-sm py-2 px-4 rounded-xl"
                >
                  <Camera size={15} /> Upload Photo
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="input-group">
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input"
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="input-group">
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="input opacity-60 cursor-not-allowed"
                  title="Email cannot be changed"
                />
                <p className="text-xs text-slate-400">Email is not editable for security reasons.</p>
              </div>
            </div>

            <div className="input-group">
              <label className="label">Short Bio</label>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself, your goals, and what you're learning..."
                className="input resize-none"
              />
              <p className="text-xs text-slate-400">{profile.bio.length} / 500 characters</p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button type="submit" disabled={saving} className="btn-primary min-w-[140px]">
                {saving ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin-smooth" />
                    Saving...
                  </>
                ) : (
                  <><Save size={15} /> Save Changes</>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setAvatarFile(null); setAvatarPreview(null); }}
                className="btn-ghost"
              >
                <X size={15} /> Cancel
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
        >
          {/* Avatar + Name Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-slate-100">
            <AvatarDisplay size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-black font-heading text-slate-900">{profile.name}</h2>
                <Badge variant={user?.role === "instructor" ? "blue" : user?.role === "admin" ? "violet" : "emerald"} dot>
                  {user?.role || "student"}
                </Badge>
              </div>
              <p className="text-slate-500 mt-1">{profile.email}</p>
            </div>
          </div>

          {/* Bio */}
          <div className="pt-6">
            <p className="text-xs font-bold font-heading text-slate-400 uppercase tracking-widest mb-3">About Me</p>
            {profile.bio ? (
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
            ) : (
              <p className="text-slate-400 italic text-sm">
                No bio yet. Click &ldquo;Edit Profile&rdquo; to add one.
              </p>
            )}
          </div>

          {/* Account Info */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid sm:grid-cols-3 gap-4">
            {[
              { label: "Account Type", value: user?.role || "Student" },
              { label: "Email Verified", value: "Yes" },
              { label: "Member Since", value: new Date().getFullYear() },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-bold font-heading text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="font-semibold text-slate-900 text-sm capitalize">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
