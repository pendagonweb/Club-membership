import { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import Cropper from "react-easy-crop";

import Lines from "../assets/lines.webp";
import CenterLogo from "../assets/logo-Malayalam.webp";
import ClubName from "../assets/logo.webp";
import Hashtag from "../assets/hashtag.webp";
import Qr from "../assets/qr.jpeg";
import UpiIcon from "../assets/Upi.webp";

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

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      0.9,
    );
  });
}

/* ======================
   CROP MODAL COMPONENT
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
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
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

        {/* Cropper area */}
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

        {/* Zoom slider */}
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
   MAIN COMPONENT
====================== */
export default function MemberRegister() {
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    nickname: "",
    email: "",
    age: "",
    dob: "",
    bloodGroup: "",
    address: "",
    phoneCode: "+91",
    phone: "",
    whatsappCode: "+91",
    whatsapp: "",
    nri: "",
    aadhaar: "",
  });

  const countryCodes = [
    { code: "+91", label: "IN" },
    { code: "+971", label: "UAE" },
    { code: "+974", label: "Qatar" },
    { code: "+966", label: "Saudi" },
    { code: "+973", label: "Bahrain" },
    { code: "+965", label: "Kuwait" },
    { code: "+968", label: "Oman" },
    { code: "+44", label: "UK" },
  ];

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Crop state
  const [cropSrc, setCropSrc] = useState(null); // raw src for cropper
  const [showCropper, setShowCropper] = useState(false);

  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { VITE_BACKEND_URL } = import.meta.env;
  const navigate = useNavigate();

  const inputClass = (field) =>
    `p-2 border rounded-lg w-full ${
      errors[field] ? "border-red-500 focus:ring-red-400" : "border-gray-300"
    }`;

  const phoneLengths = {
    "+91": [10], // India
    "+971": [9], // UAE
    "+974": [8], // Qatar
    "+966": [9], // Saudi Arabia
    "+973": [8], // Bahrain
    "+965": [8], // Kuwait
    "+968": [8], // Oman
    "+44": [10], // UK
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...formData, [name]: value };

    if (sameAsPhone && name === "phone") updatedForm.whatsapp = value;
    if (sameAsPhone && name === "phoneCode") updatedForm.whatsappCode = value;

    if (name === "dob" && value) {
      const age = calculateAge(value);
      updatedForm.age = age > 0 ? age : "";
    }

    setFormData(updatedForm);
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const compressImage = async (file) =>
    await imageCompression(file, { maxSizeMB: 0.4, maxWidthOrHeight: 900 });

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    )
      age--;
    return age;
  };

  /* ======================
     PHOTO: open file → show cropper
  ====================== */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset input so same file can be re-selected after cancel
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    if (errors.photo) setErrors({ ...errors, photo: "" });
  };

  /* ======================
     CROP DONE: compress → store
  ====================== */
  const handleCropDone = async (croppedBlob) => {
    setShowCropper(false);
    setCropSrc(null);
    const compressed = await compressImage(
      new File([croppedBlob], "photo.jpg", { type: "image/jpeg" }),
    );
    setPhoto(compressed);
    setPhotoPreview(URL.createObjectURL(compressed));
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropSrc(null);
  };

  const handlePaymentChange = async (e) => {
    if (!e.target.files[0]) return;
    setPaymentScreenshot(await compressImage(e.target.files[0]));
    if (errors.payment) setErrors({ ...errors, payment: "" });
  };

  /* ======================
     VALIDATION
  ====================== */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 3)
      newErrors.name = "Full name must be at least 3 characters";
    if (!formData.nickname || formData.nickname.trim().length < 2)
      newErrors.nickname = "Nickname is required";
    if (!formData.fatherName || formData.fatherName.trim().length < 3)
      newErrors.fatherName = "Father name is required";
    const validPhoneLengths = phoneLengths[formData.phoneCode] ?? [
      7, 8, 9, 10, 11,
    ];
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!phoneDigits || !validPhoneLengths.includes(phoneDigits.length))
      newErrors.phone = `Enter a valid phone number for ${formData.phoneCode}`;
    if (!/^\d{12}$/.test(formData.aadhaar))
      newErrors.aadhaar = "Enter valid 12 digit Aadhaar number";
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Enter a valid email address";
    if (!formData.age && !formData.dob) {
      newErrors.age = "Enter Age or select Date of Birth";
      newErrors.dob = "Enter Age or select Date of Birth";
    }
    if (!formData.nri) newErrors.nri = "Please select NRI status";
    if (formData.age && Number(formData.age) < 1)
      newErrors.age = "Enter a valid age";
    if (!formData.bloodGroup)
      newErrors.bloodGroup = "Please select blood group";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    const waCode = sameAsPhone ? formData.phoneCode : formData.whatsappCode;
    const waNumber = sameAsPhone ? formData.phone : formData.whatsapp;
    const validWaLengths = phoneLengths[waCode] ?? [7, 8, 9, 10, 11];
    const waDigits = waNumber.replace(/\D/g, "");
    if (!waDigits || !validWaLengths.includes(waDigits.length))
      newErrors.whatsapp = "Invalid WhatsApp number";
    if (!photo) newErrors.photo = "Profile photo is required";
    if (!paymentScreenshot)
      newErrors.payment = "Payment screenshot is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const payViaUPI = () => {
    const upiUrl = `upi://pay?pa=sabiaboobacker653-1@okaxis&pn=${encodeURIComponent("Club Membership")}&cu=INR&tn=Membership Fee`;
    window.location.href = upiUrl;
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
      data.append("name", formData.name);
      data.append("fatherName", formData.fatherName);
      data.append("nickname", formData.nickname);
      data.append("aadhaar", formData.aadhaar);
      if (formData.email) data.append("email", formData.email);
      data.append("age", Number(formData.age));
      data.append("bloodGroup", formData.bloodGroup);
      data.append("address", formData.address);
      data.append("nri", formData.nri);
      if (formData.dob) data.append("dob", formData.dob);
      data.append("phone", formData.phone);
      data.append("phoneCode", formData.phoneCode);
      data.append("whatsappCode", sameAsPhone ? formData.phoneCode : formData.whatsappCode);
      data.append("whatsapp", sameAsPhone ? formData.phone : formData.whatsapp);
      data.append("photo", photo);
      data.append("paymentProof", paymentScreenshot);

      await axios.post(`${VITE_BACKEND_URL}/api/auth/register`, data);
      setShowSuccessModal(true);
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 sm:px-6">
      <img
        src={Lines}
        className="absolute bottom-0 left-0 w-full h-[400px] opacity-40 -z-10 object-cover"
        alt=""
      />

      <div className="relative w-full max-w-3xl rounded-2xl px-4 sm:px-8 py-6 bg-white/90">
        <img src={Hashtag} className="absolute right-4 bottom-0 h-6" alt="" />

        <div className="flex flex-col items-center gap-2 mb-3 md:flex-row md:justify-center">
          <img src={CenterLogo} className="h-16" />
          <img src={ClubName} className="h-16" />
        </div>

        <h1 className="text-center text-xl sm:text-2xl font-extrabold mb-4">
          MEMBER REGISTRATION
        </h1>

        <form
          onSubmit={handleSubmit}
          className={`max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-8 ${
            loading ? "pointer-events-none opacity-70" : ""
          }`}
        >
          {/* PERSONAL DETAILS */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Personal Details
            </h3>
            <input
              name="name"
              placeholder="Full Name / മുഴുവൻ പേര്"
              onChange={handleChange}
              className={`${inputClass("name")} placeholder:text-[11px]`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}
            <div>
              <input
                name="nickname"
                placeholder="Nickname / അറിയപ്പെടുന്ന പേര്"
                onChange={handleChange}
                className={`${inputClass("nickname")} placeholder:text-[11px]`}
              />
              {errors.nickname && (
                <p className="text-red-500 text-xs">{errors.nickname}</p>
              )}
            </div>
            <input
              name="fatherName"
              placeholder="Father Name / പിതാവിന്റെ പേര്"
              onChange={handleChange}
              className={`${inputClass("fatherName")} placeholder:text-[11px]`}
            />
            {errors.fatherName && (
              <p className="text-red-500 text-xs">{errors.fatherName}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="aadhaar"
              placeholder="Aadhaar Number / ആധാർ നമ്പർ"
              maxLength={12}
              onChange={handleChange}
              className={`${inputClass("aadhaar")} placeholder:text-[11px]`}
            />
            {errors.aadhaar && (
              <p className="text-red-500 text-xs">{errors.aadhaar}</p>
            )}
          </div>

          {/* CONTACT DETAILS */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Email (optional)
                </label>
                <input
                  name="email"
                  placeholder="example@mail.com"
                  onChange={handleChange}
                  className={`p-2 border rounded-xl w-full text-sm ${errors.email ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Phone / Mobile
                </label>
                <div className="flex items-center border rounded-xl overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-blue-500">
                  <select
                    name="phoneCode"
                    value={formData.phoneCode}
                    onChange={handleChange}
                    className="bg-gray-100 px-3 py-2 w-20 border-r border-gray-300 text-sm outline-none"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter number"
                    className="flex-1 p-2 outline-none text-sm"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs">{errors.phone}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  WhatsApp Number
                </label>
                <div className="flex items-center border rounded-xl overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-green-500">
                  <select
                    name="whatsappCode"
                    value={formData.whatsappCode}
                    disabled={sameAsPhone}
                    onChange={handleChange}
                    className="bg-gray-50 w-20 px-3 py-2 border-r border-gray-300 text-sm disabled:opacity-50 outline-none"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    disabled={sameAsPhone}
                    placeholder="Enter number"
                    className="flex-1 p-2 outline-none text-sm"
                  />
                </div>
                {errors.whatsapp && (
                  <p className="text-red-500 text-xs">{errors.whatsapp}</p>
                )}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <input
                type="checkbox"
                checked={sameAsPhone}
                onChange={(e) => {
                  setSameAsPhone(e.target.checked);
                  if (e.target.checked)
                    setFormData((p) => ({
                      ...p,
                      whatsapp: p.phone,
                      whatsappCode: p.phoneCode,
                    }));
                  else setFormData((p) => ({ ...p, whatsapp: "" }));
                }}
                className="w-4 h-4 accent-blue-600"
              />
              WhatsApp number same as phone
            </label>
          </div>

          {/* BASIC INFO */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Basic Information
            </h3>
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <input
                  type="number"
                  name="age"
                  placeholder="Age / വയസ്"
                  value={formData.age}
                  onChange={handleChange}
                  className={`${inputClass("age")} placeholder:text-[11px]`}
                />
                {errors.age && (
                  <p className="text-red-500 text-xs">{errors.age}</p>
                )}
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-4 bg-white px-1 text-[11px] text-gray-500">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  onChange={handleChange}
                  className={inputClass("dob")}
                />
                {errors.dob && (
                  <p className="text-red-500 text-xs">{errors.dob}</p>
                )}
              </div>
              <div>
                <select
                  name="bloodGroup"
                  onChange={handleChange}
                  className={inputClass("bloodGroup")}
                >
                  <option value="">Blood Group</option>
                  {[
                    "A+",
                    "A-",
                    "B+",
                    "B-",
                    "AB+",
                    "AB-",
                    "O+",
                    "O-",
                    "Nil",
                  ].map((bg) => (
                    <option key={bg}>{bg}</option>
                  ))}
                </select>
                {errors.bloodGroup && (
                  <p className="text-red-500 text-xs">{errors.bloodGroup}</p>
                )}
              </div>
              <div>
                <select
                  name="nri"
                  value={formData.nri}
                  onChange={handleChange}
                  className={inputClass("nri")}
                >
                  <option value="">Select NRI Status</option>
                  <option value="Yes">NRI - Yes</option>
                  <option value="No">NRI - No</option>
                </select>
                {errors.nri && (
                  <p className="text-red-500 text-xs">{errors.nri}</p>
                )}
              </div>
            </div>
          </div>

          {/* ADDRESS */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Address
            </h3>
            <textarea
              name="address"
              placeholder="Address / അഡ്രസ്"
              onChange={handleChange}
              className={`${inputClass("address")} placeholder:text-[11px] h-24`}
            />
            {errors.address && (
              <p className="text-red-500 text-xs">{errors.address}</p>
            )}
          </div>

          {/* UPLOADS & PAYMENT */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Upload & Payment
            </h3>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-5">
                {/* ── PROFILE PHOTO with crop ── */}
                <div>
                  <label className="text-sm font-medium">Profile Photo</label>
                  <div className="relative border-2 border-dashed rounded-2xl p-4 text-center hover:border-blue-400 transition">
                    {photoPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={photoPreview}
                          className="w-20 h-20 rounded-full mx-auto object-cover shadow ring-2 ring-indigo-400"
                        />
                        <span className="text-xs text-indigo-600 font-medium">
                          ✓ Photo selected
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("photoInput").click()
                          }
                          className="text-xs text-gray-500 underline hover:text-indigo-600"
                        >
                          Change photo
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 py-2">
                        <div className="w-14 h-14 rounded-full bg-indigo-50 border-2 border-dashed border-indigo-300 flex items-center justify-center text-2xl">
                          📷
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Upload photo / ഫോട്ടോ അപ്ലോഡ് ചെയ്യുക
                        </p>
                        <p className="text-[10px] text-indigo-500 font-medium">
                          You can crop after selecting
                        </p>
                      </div>
                    )}
                    <input
                      id="photoInput"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {errors.photo && (
                    <p className="text-red-500 text-xs mt-1">{errors.photo}</p>
                  )}
                </div>

                {/* PAYMENT SCREENSHOT */}
                <div>
                  <label className="text-sm font-medium">
                    Payment Screenshot
                  </label>
                  <div className="relative border-2 border-dashed rounded-2xl p-4 text-center hover:border-blue-400 transition">
                    {paymentScreenshot ? (
                      <img
                        src={URL.createObjectURL(paymentScreenshot)}
                        className="w-32 mx-auto rounded-lg shadow"
                      />
                    ) : (
                      <p className="text-[11px] text-gray-500">
                        Upload payment screenshot / രസീത് അപ്ലോഡ് ചെയ്യുക
                      </p>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePaymentChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {errors.payment && (
                    <p className="text-red-500 text-xs">{errors.payment}</p>
                  )}
                </div>
              </div>

              {/* QR */}
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={payViaUPI}
                  className="flex items-center justify-center gap-2 px-3 py-1 text-xs sm:text-sm font-semibold rounded-lg bg-gray-300 text-black border hover:shadow-lg transition"
                >
                  <img src={UpiIcon} alt="UPI" className="w-8 h-4" />
                  Pay via UPI
                </button>
                <div className="relative w-36">
                  <img
                    src={Qr}
                    alt="QR Code"
                    className="w-full rounded-xl shadow cursor-pointer"
                    onClick={() => setShowQR(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowQR(true)}
                    className="absolute inset-0 bg-black/40 text-white rounded-xl flex items-center justify-center text-sm"
                  >
                    View QR
                  </button>
                </div>
                {showQR && (
                  <div
                    className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-4"
                    onClick={() => setShowQR(false)}
                  >
                    <img
                      src={Qr}
                      alt="QR Code"
                      className="max-w-full max-h-full rounded-xl shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <a
                      href={Qr}
                      download="ClubPaymentQR"
                      className="mt-4 px-6 py-2 bg-blue-700 text-white rounded-xl text-sm hover:bg-blue-800 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Download QR
                    </a>
                    <button
                      onClick={() => setShowQR(false)}
                      className="mt-2 text-white text-sm underline"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white py-3 rounded-2xl font-semibold hover:scale-[1.01] transition disabled:opacity-60"
          >
            {loading ? "Registering..." : "REGISTER"}
          </button>
        </form>
      </div>

      {/* CROP MODAL */}
      {showCropper && cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          onCropDone={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal &&(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center">
            <h2 className="text-2xl font-bold text-green-600">
              Registration Successful 🎉
            </h2>
            <p
              className="mt-4 text-black px-6 py-2 italic text-sm"
            >
              Waiting for approval. Your membership request<br/> will be approved by the Secretary shortly
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
