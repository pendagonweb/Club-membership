import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cropper from "react-easy-crop";
import MembershipCard from "../pages/MemberCard";

/* ======================
   CROP HELPERS
====================== */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
}

/* ======================
   CROP MODAL
====================== */
function CropModal({ imageSrc, onCropDone, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropDone(croppedBlob);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="bg-indigo-600 px-5 py-3 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">Crop Photo</h3>
          <button
            onClick={onCancel}
            className="text-white/80 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Cropper */}
        <div
          className="relative w-full bg-gray-900"
          style={{ height: "320px" }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-10">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-indigo-600"
            />
            <span className="text-xs text-gray-500 w-8">
              {zoom.toFixed(1)}x
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            >
              ✓ Use This Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================
   MAIN DASHBOARD
====================== */
export default function MemberDashboard() {
  const STATIC_VALID_UPTO = "31/03/2027";

  // ── Pick the earlier of member.expiryDate vs STATIC_VALID_UPTO ──────────
  const getEffectiveValidUpto = (member) => {
    const [sd, sm, sy] = STATIC_VALID_UPTO.split("/").map(Number);
    const staticExpiry = new Date(sy, sm - 1, sd);

    if (member?.expiryDate) {
      const memberExpiry = new Date(member.expiryDate);
      // If member's expiry is before static, use member's (formatted as dd/mm/yyyy)
      if (memberExpiry < staticExpiry) {
        const d = String(memberExpiry.getDate()).padStart(2, "0");
        const m = String(memberExpiry.getMonth() + 1).padStart(2, "0");
        const y = memberExpiry.getFullYear();
        return `${d}/${m}/${y}`;
      }
    }
    // member.expiryDate is beyond static OR not set → use static
    return STATIC_VALID_UPTO;
  };

  const getRemainingDays = (validUpto) => {
    const [day, month, year] = validUpto.split("/").map(Number);
    const expiry = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const { VITE_BACKEND_URL } = import.meta.env;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      navigate("/");
      return;
    }

    axios
      .get(`${VITE_BACKEND_URL}/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMember(res.data.user);
        setLoading(false);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return "N/A";
    return `XXXX XXXX ${aadhaar.slice(-4)}`;
  };

  const handleUpdateSuccess = (updatedUser) => {
    setMember(updatedUser);
    setShowEdit(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading dashboard...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Membership under review
      </div>
    );
  }
  const effectiveValidUpto = getEffectiveValidUpto(member); // ← ADD HERE

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <aside className="hidden md:block w-64 bg-indigo-500 text-white p-6 shadow-xl">
        <h2 className="text-2xl font-extrabold tracking-wide mb-10">
          Member Panel
        </h2>
        <nav className="space-y-4">
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-800 font-semibold cursor-default">
            📊 Dashboard
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 transition-all font-semibold"
          >
            ✏️ Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-all font-semibold"
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 space-y-8">
        {/* PROFILE HEADER */}
        {/* PROFILE HEADER */}
        <div className="bg-white rounded-3xl shadow-xl p-4 flex flex-col md:flex-row gap-6 items-center transition-all hover:shadow-2xl">
          <img
            src={member.photo || "/default-avatar.png"}
            alt={member.name}
            className="w-40 h-40 rounded-full border-4 border-indigo-500 object-cover shadow-md"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-xl font-extrabold uppercase text-indigo-600 tracking-wide">
              {member.nickname}
            </h1>
            {member.nri === "Yes" && (
              <span className="inline-block py-1 text-xl font-bold text-green-700">
                NRI
              </span>
            )}
            <p className="text-gray-600 mt-1 text-lg">{member.phone}</p>
            <span className="inline-block mt-2 px-3 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700">
              {member.membershipId?.toUpperCase()}
            </span>
          </div>

          {/* ── DAYS REMAINING BADGE ── */}

          {(() => {
            const days = getRemainingDays(effectiveValidUpto); // ← was STATIC_VALID_UPTO
            const isExpiringSoon = days <= 30;
            const isExpired = days <= 0;
            return (
              <div
                className={`flex flex-col items-center justify-center rounded-2xl px-5 py-4 shadow-md min-w-[110px] ${
                  isExpired
                    ? "bg-red-50 border border-red-200"
                    : isExpiringSoon
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-indigo-50 border border-indigo-200"
                }`}
              >
                <span
                  className={`text-3xl font-extrabold leading-none ${
                    isExpired
                      ? "text-red-600"
                      : isExpiringSoon
                        ? "text-amber-500"
                        : "text-indigo-600"
                  }`}
                >
                  {isExpired ? "0" : days}
                </span>
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wide mt-1 ${
                    isExpired
                      ? "text-red-400"
                      : isExpiringSoon
                        ? "text-amber-400"
                        : "text-indigo-400"
                  }`}
                >
                  {isExpired ? "Expired" : "Days Left"}
                </span>
                <span
                  className={`text-[10px] mt-1 ${
                    isExpired
                      ? "text-red-300"
                      : isExpiringSoon
                        ? "text-amber-300"
                        : "text-indigo-300"
                  }`}
                >
                  Valid: {effectiveValidUpto} {/* ← was STATIC_VALID_UPTO */}
                </span>
              </div>
            );
          })()}

          <button
            onClick={() => setShowEdit(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-all"
          >
            ✏️ Edit Profile
          </button>
        </div>

        {member.membershipStatus === "approved" && (
          <div className="rounded-3xl shadow-xl bg-white p-3 flex flex-col items-center gap-6 transition-all hover:shadow-2xl">
            <MembershipCard user={member} />
          </div>
        )}

        {/* USER DETAILS */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6 border-b pb-2">
            <h2 className="text-2xl font-bold text-indigo-700">
              Member Details
            </h2>
            <button
              onClick={() => setShowEdit(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-all"
            >
              ✏️ Edit Profile
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <Detail label="Full Name" value={member.name} />
            <Detail label="Father's Name" value={member.fatherName} />
            <Detail label="Membership ID" value={member.membershipId} />
            <Detail label="Phone" value={member.phone} />
            <Detail label="WhatsApp" value={member.whatsapp} />
            <Detail label="Blood Group" value={member.bloodGroup || "N/A"} />
            <Detail label="Aadhaar" value={maskAadhaar(member.aadhaar)} />
            <Detail label="Email" value={member.email || "N/A"} />
            <Detail label="Age" value={member.age} />
            <Detail label="Address" value={member.address} />
            <Detail label="NRI" value={member.nri || "No"} />
            <Detail label="Valid Upto" value={effectiveValidUpto} />{" "}
            <Detail
              label="Joined On"
              value={new Date(member.createdAt).toLocaleDateString()}
            />
          </div>
        </div>
      </main>

      {showEdit && (
        <EditProfileModal
          member={member}
          onClose={() => setShowEdit(false)}
          onSuccess={handleUpdateSuccess}
          backendUrl={VITE_BACKEND_URL}
        />
      )}
    </div>
  );
}

/* ======================
   EDIT MODAL
====================== */
function EditProfileModal({ member, onClose, onSuccess, backendUrl }) {
  const [form, setForm] = useState({
    name: member.name || "",
    fatherName: member.fatherName || "",
    nickname: member.nickname || "",
    email: member.email || "",
    age: member.age || "",
    phone: member.phone || "",
    whatsapp: member.whatsapp || "",
    bloodGroup: member.bloodGroup || "",
    address: member.address || "",
    dob: member.dob ? member.dob.slice(0, 10) : "",
    nri: member.nri || "No",
    aadhaar: member.aadhaar || "",
    password: member.password || "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    member.photo || "/default-avatar.png",
  );

  // Crop state
  const [cropSrc, setCropSrc] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* Open file → read as data URL → show cropper */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be re-picked after cancel
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  /* Crop confirmed → store blob + preview */
  const handleCropDone = (croppedBlob) => {
    setShowCropper(false);
    setCropSrc(null);
    const file = new File([croppedBlob], "photo.jpg", { type: "image/jpeg" });
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(croppedBlob));
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropSrc(null);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (photoFile) formData.append("photo", photoFile);

      const res = await axios.put(
        `${backendUrl}/api/user/update/${userId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        onSuccess(res.data.user);
      } else {
        setError(res.data.message || "Update failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b flex items-center justify-between z-10">
            <h2 className="text-2xl font-extrabold text-indigo-700">
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* PHOTO with crop */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-indigo-400 object-cover shadow-md"
                />
                {/* Camera overlay button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all text-base"
                  title="Change photo"
                >
                  📷
                </button>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-2 rounded-xl bg-indigo-100 text-indigo-700 text-sm font-semibold hover:bg-indigo-200 transition-all"
              >
                📷 Change Photo
              </button>
              <p className="text-[11px] text-indigo-400">
                You can crop after selecting
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              {photoFile && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ New photo ready
                </p>
              )}
            </div>

            {/* FORM FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              <Field
                label="Father's Name"
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
              />
              <Field
                label="Nickname"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
              />
              <Field
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
              <Field
                label="Age"
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
              />
              <Field
                label="Phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
              />
              <Field
                label="WhatsApp"
                name="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={handleChange}
              />
              <Field
                label="Date of Birth"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
              />
              <Field
                label="Aadhaar (12 digits)"
                name="aadhaar"
                value={form.aadhaar}
                onChange={handleChange}
                maxLength={12}
              />
              <Field
                label="Password"
                name="password"
                type="pass"
                value={form.password}
                onChange={handleChange}
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  className="border border-indigo-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50"
                >
                  {[
                    "A+",
                    "A-",
                    "B+",
                    "B-",
                    "O+",
                    "O-",
                    "AB+",
                    "AB-",
                    "Nil",
                  ].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                  NRI Status
                </label>
                <select
                  name="nri"
                  value={form.nri}
                  onChange={handleChange}
                  className="border border-indigo-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className="border border-indigo-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50 resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-indigo-200 text-indigo-600 font-semibold hover:bg-indigo-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-4 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CROP MODAL — rendered outside the edit modal so it sits above z-50 */}
      {showCropper && cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          onCropDone={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}

/* ======================
   HELPERS
====================== */
function Detail({ label, value }) {
  return (
    <div className="bg-indigo-50 rounded-xl p-4 hover:bg-indigo-100 transition-all duration-200 shadow-sm">
      <p className="text-indigo-600 text-xs font-medium">{label}</p>
      <p className="font-semibold text-gray-800 text-sm md:text-base">
        {value}
      </p>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", maxLength }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="border border-indigo-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50"
      />
    </div>
  );
}
