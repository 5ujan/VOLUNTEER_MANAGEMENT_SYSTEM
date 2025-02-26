import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";
import ApiServices from "../frontend-lib/api/ApiServices";
import { FiEdit, FiSave, FiTrash, FiUpload, FiXCircle } from "react-icons/fi";
import Navbar from "../components/Nav";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role: "",
    avatar: "",
    created_at: "",
    skills: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useStore();
  const [events, setEvents] = useState([]);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await ApiServices.getUser();
        const skills = await ApiServices.getAllSkills();
        const events = await ApiServices.getEventsByOrganization(data?.id);
        setAvailableSkills(skills);
        setEvents(events);
        setProfileData({
          ...data,
          skills: data.skills || [],
        });
        setImagePreview(data?.avatar || "");
        setUser(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    setImagePreview(URL.createObjectURL(file));
    setProfileData((prevData) => ({
      ...prevData,
      avatar: file,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddSkill = () => {
    if (newSkill && !profileData.skills.includes(newSkill)) {
      setProfileData((prevData) => ({
        ...prevData,
        skills: [...prevData.skills, newSkill],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setProfileData((prevData) => ({
      ...prevData,
      skills: prevData.skills.filter((s) => s !== skill),
    }));
  };

  const handleSaveChanges = async () => {
    try {
      // Construct profile data JSON

      // If there's a new profile image, upload it first and get the URL
      if (profileData.avatar instanceof File) {
        const imageUrl = await ApiServices.uploadPhotoToCloudinary(
          profileData.avatar
        );
        profileData.avatar = imageUrl;
      }
    //   console.log({ profileData });
      const updatedProfile = await ApiServices.updateUserData({
        ...user,
        ...profileData,
      });
      // setProfileData(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };
  const eventCard = (event) => {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold">{event.programme_name}</h2>
        {/* <p className="text-lg">{event.description}</p> */}
        <p className="text-md">
          {event.start_date.split("T")[0]}-{event.end_date.split("T")[0]}
        </p>
      </div>
    );
  };
  return (
    <div className="bg-black w-full">
      <Navbar />
      {!loading && (
        <div className="text-white min-h-screen w-full flex items-start justify-start px-10">
          <div className="container p-6 w-full">
            <h2 className="text-4xl font-bold mb-6 text-left text-dark-green">
              Profile
            </h2>
            <section className="flex gap-4 w-full">
              <section className="bg-gray-800 h-full w-2/3 rounded-xl pr-1 pb-1 text-white ">
                <div className="bg-gray-700 p-8 rounded-xl shadow-xl">
                  <div className="flex flex-col md:flex-row items-center">
                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center mb-6 md:mb-0">
                      <div className="relative">
                        <div className="w-40 h-40 rounded-full bg-gray-500 overflow-hidden">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={profileData.avatar || "/default-profile.png"}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        {isEditing && (
                          <label
                            htmlFor="image-upload"
                            className="absolute bottom-0 right-0 bg-dark-green text-white p-2 rounded-full cursor-pointer"
                          >
                            <FiUpload />
                          </label>
                        )}
                      </div>
                      {isEditing && (
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                        />
                      )}
                    </div>

                    {/* User Info Section */}
                    <div className="md:ml-8 w-full">
                      {Object.entries(profileData).map(([key, value]) => {
                        if (["id", "role", "avatar", "skills"].includes(key))
                          return null;

                        const label =
                          key === "dob"
                            ? "Date Of Birth"
                            : key
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase());

                        return (
                          <div key={key} className="mb-6">
                            <label className="block text-gray-400 mb-2">
                              {label}
                            </label>
                            {isEditing ? (
                              <input
                                type={
                                  key.includes("date")
                                    ? "date"
                                    : key === "email"
                                    ? "email"
                                    : "text"
                                }
                                name={key}
                                value={
                                  key.includes("date") && value
                                    ? value.split("T")[0]
                                    : value || ""
                                }
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md bg-gray-600 text-white"
                              />
                            ) : (
                              <p className="text-xl">
                                {new Date(value) instanceof Date && value
                                  ? value?.split("T")[0] || ""
                                  : value}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* Skills Section ( @yujal in case of organization idk what to add so improvise)*/}
              {user?.volunteer_id ? (
                <section className="bg-gray-800 w-1/3 rounded-xl pr-1 pb-1 text-white">
                  <div className="bg-gray-700 p-8 rounded-xl h-full shadow-xl">
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold text-white">
                        Skills
                      </h3>
                      <ul className="flex gap-3 flex-wrap mt-3">
                        {profileData?.skills?.map((skill) => (
                          <li
                            key={skill}
                            className="bg-green-600 px-3 py-1 rounded-full text-white flex items-center"
                          >
                            {isEditing ? (
                              <>
                                {skill}
                                <button
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="ml-2 text-red-500"
                                >
                                  <FiXCircle />
                                </button>
                              </>
                            ) : (
                              <p>{skill}</p>
                            )}
                          </li>
                        ))}
                      </ul>

                      {/* Dropdown for Adding Skills */}
                      {isEditing && (
                        <div className="mt-4">
                          <select
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md bg-gray-600 text-white"
                          >
                            <option value="">Select a skill</option>
                            {availableSkills
                              .filter(
                                (skill) => !profileData.skills.includes(skill)
                              ) // Prevent duplicates
                              .map((skill) => (
                                <option
                                  key={skill.skill_name}
                                  value={skill.skill_name}
                                >
                                  {skill.skill_name}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => {
                              if (newSkill) {
                                handleAddSkill(newSkill);
                                setNewSkill(""); // Reset after adding
                              }
                            }}
                            className="mt-2 bg-green-500 text-white py-2 px-4 rounded-md"
                            disabled={!newSkill}
                          >
                            Add Skill
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              ) : (
                <section className="bg-gray-800 w-1/3 rounded-xl pr-1 pb-1 text-white">
                  <div className="bg-gray-700 p-8 rounded-xl h-full shadow-xl">
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold text-white">
                        Organized Events
                      </h3>
                      {events && (
                        <div className="mt-4 flex flex-col gap-3">
                          {events.slice(0, 4).map(eventCard)}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </section>

            {/* Edit and Save Buttons */}
            <div className="flex items-center justify-between mt-6">
              {isEditing ? (
                <div className="flex justify-start gap-2">
                  <button
                    onClick={handleSaveChanges}
                    className="bg-dark-green text-white py-2 px-6 rounded-md flex items-center hover:bg-[#137863]"
                  >
                    <FiSave className="mr-2" /> Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-red-500 text-white py-2 px-6 rounded-md flex items-center hover:bg-red-600"
                  >
                    <FiTrash className="mr-2"></FiTrash> Discard Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="bg-blue-500 text-white py-2 px-6 rounded-md flex items-center hover:bg-blue-600"
                >
                  <FiEdit className="mr-2" /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
