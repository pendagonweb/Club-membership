// src/pages/JuniorRegister.jsx
import { useState, useRef } from "react";
import axios from "axios";

export default function JuniorRegister() {
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    dob: "",
    occupation: "",
    mobile: "",
    place: "",
    membershipId: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { VITE_BACKEND_URL } = import.meta.env;

  /* ======================
     HELPERS
  ====================== */
  const inputClass = (field) =>
    `p-2 border rounded-lg w-full ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /* ======================
     PHOTO HANDLING (camera + gallery)
  ====================== */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // allow re-selecting the same file again later
    e.target.value = "";
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    if (errors.photo) setErrors((prev) => ({ ...prev, photo: "" }));
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  /* ======================
     VALIDATION
  ====================== */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 3)
      newErrors.name = "Name must be at least 3 characters";

    if (!formData.fatherName || formData.fatherName.trim().length < 3)
      newErrors.fatherName = "Father name is required";

    if (!formData.occupation || formData.occupation.trim().length < 2)
      newErrors.occupation = "Occupation is required";

    if (!/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = "Enter valid 10-digit mobile number";

    if (formData.place && formData.place.trim().length < 2)
      newErrors.place = "Place must be valid";

    if (!formData.membershipId || !formData.membershipId.trim()) {
      newErrors.membershipId = "Membership ID is required";
    } else {
      const digitCount = (formData.membershipId.match(/\d/g) || []).length;
      if (digitCount < 3) {
        newErrors.membershipId = "Membership ID must contain at least 3 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ======================
     SUBMIT
  ====================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      if (photo) data.append("photo", photo);

      await axios.post(`${VITE_BACKEND_URL}/api/juniors/juniorregister`, data);

      setSuccess(true);

      // Reset form
      setFormData({
        name: "",
        fatherName: "",
        dob: "",
        occupation: "",
        mobile: "",
        place: "",
        membershipId: "",
      });
      removePhoto();
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">
          Junior Registration
        </h2>

        {/* PHOTO UPLOAD */}
        <div className="flex flex-col items-center gap-2">
          {photoPreview ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src={photoPreview}
                alt="preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-indigo-300"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="text-xs text-red-500 underline"
              >
                Remove photo
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-50 border-2 border-dashed border-indigo-300 flex items-center justify-center text-3xl">
              📷
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current.click()}
              className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              📸 Take Photo
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current.click()}
              className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              🖼️ Choose from Gallery
            </button>
          </div>

          {/* Camera capture input */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoChange}
          />
          {/* Gallery picker input */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />

          {errors.photo && (
            <p className="text-red-500 text-sm">{errors.photo}</p>
          )}
        </div>

        {/* NAME */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className={inputClass("name")}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

        {/* FATHER NAME */}
        <input
          type="text"
          name="fatherName"
          placeholder="Father Name"
          value={formData.fatherName}
          onChange={handleChange}
          className={inputClass("fatherName")}
        />
        {errors.fatherName && (
          <p className="text-red-500 text-sm">{errors.fatherName}</p>
        )}

        {/* DOB */}
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          className={inputClass("dob")}
        />

        {/* OCCUPATION */}
        <input
          type="text"
          name="occupation"
          placeholder="Occupation"
          value={formData.occupation}
          onChange={handleChange}
          className={inputClass("occupation")}
        />
        {errors.occupation && (
          <p className="text-red-500 text-sm">{errors.occupation}</p>
        )}

        {/* MOBILE */}
        <input
          type="tel"
          name="mobile"
          placeholder="Mobile Number"
          value={formData.mobile}
          onChange={handleChange}
          className={inputClass("mobile")}
        />
        {errors.mobile && (
          <p className="text-red-500 text-sm">{errors.mobile}</p>
        )}

        {/* PLACE */}
        <input
          type="text"
          name="place"
          placeholder="Place (Optional)"
          value={formData.place}
          onChange={handleChange}
          className={inputClass("place")}
        />
        {errors.place && <p className="text-red-500 text-sm">{errors.place}</p>}

        {/* MEMBERSHIP ID */}
        <input
          type="text"
          name="membershipId"
          placeholder="Membership ID (must include at least 3 digits)"
          value={formData.membershipId}
          onChange={handleChange}
          className={inputClass("membershipId")}
        />
        {errors.membershipId && (
          <p className="text-red-500 text-sm">{errors.membershipId}</p>
        )}

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90"
        >
          {loading ? "Submitting..." : "Register"}
        </button>

        {/* SUCCESS */}
        {success && (
          <p className="text-green-600 text-center text-sm">
            Registration successful!
          </p>
        )}
      </form>
    </div>
  );
}
