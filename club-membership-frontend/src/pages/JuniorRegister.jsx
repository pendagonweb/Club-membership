import { useState } from "react";
import axios from "axios";

export default function JuniorRegister() {
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    dob: "",
    occupation: "",
    mobile: "",
    place: "",
  });

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

      await axios.post(`${VITE_BACKEND_URL}/api/auth/juniorregister`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);

      // Reset form
      setFormData({
        name: "",
        fatherName: "",
        dob: "",
        occupation: "",
        mobile: "",
        place: "",
      });
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
