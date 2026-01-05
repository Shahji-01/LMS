import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfilePage = () => {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/v1/user/profile");
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold">My Profile</h2>
          <p className="text-gray-600 mt-2">
            Manage your personal information
          </p>
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

          {loading ? (
            <p className="text-gray-600">Loading profile...</p>
          ) : (
            <div className="flex items-center gap-6">

              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
                {profile.name?.charAt(0)?.toUpperCase()}
              </div>

              {/* Info */}
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-lg font-medium">{profile.name}</p>

                <p className="text-sm text-gray-500 mt-4">Email</p>
                <p className="text-lg font-medium">{profile.email}</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
