import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cropper from "react-easy-crop";
import {
  HiSpeakerphone,
  HiCheckCircle,
  HiChartBar,
  HiPencil,
  HiLogout,
  HiHome,
  HiClipboardCheck,
  HiCamera,
  HiCheck,
  HiArrowLeft,
  HiGlobe,
  HiBadgeCheck,
  HiExclamationCircle,
  HiSave,
  HiX,
  HiInformationCircle,
  HiUserGroup,
  HiSparkles,
  HiEye,
  HiEyeOff,
} from "react-icons/hi";
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
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col">
      {/* Header */}
      <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between safe-area-top shrink-0">
        <button
          onClick={onCancel}
          className="text-white/80 hover:text-white text-base font-semibold px-1 py-1 min-w-[44px] min-h-[44px] flex items-center gap-1.5"
        >
          <HiArrowLeft className="text-lg" />
          Cancel
        </button>
        <h3 className="text-white font-bold text-base">Crop Photo</h3>
        <button
          onClick={handleDone}
          className="text-white font-bold text-base px-1 py-1 min-w-[44px] min-h-[44px] flex items-center justify-end gap-1.5"
        >
          Done
          <HiCheck className="text-lg" />
        </button>
      </div>

      {/* Cropper — takes all remaining space */}
      <div className="relative flex-1 bg-black">
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

      {/* Zoom control pinned to bottom */}
      <div className="bg-black px-6 py-5 safe-area-bottom shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-white/50 text-xs w-6">−</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-indigo-500 h-1"
          />
          <span className="text-white/50 text-xs w-6">+</span>
        </div>
        <p className="text-white/40 text-center text-xs mt-2">
          Pinch or drag slider to zoom
        </p>
      </div>
    </div>
  );
}

/* ======================
   MAIN DASHBOARD
====================== */
export default function MemberDashboard() {
  const STATIC_VALID_UPTO = "31/03/2027";

  const getEffectiveValidUpto = (member) => {
    const [sd, sm, sy] = STATIC_VALID_UPTO.split("/").map(Number);
    const staticExpiry = new Date(sy, sm - 1, sd);
    if (member?.expiryDate) {
      const memberExpiry = new Date(member.expiryDate);
      if (memberExpiry < staticExpiry) {
        const d = String(memberExpiry.getDate()).padStart(2, "0");
        const m = String(memberExpiry.getMonth() + 1).padStart(2, "0");
        const y = memberExpiry.getFullYear();
        return `${d}/${m}/${y}`;
      }
    }
    return STATIC_VALID_UPTO;
  };

  const getRemainingDays = (validUpto) => {
    const [day, month, year] = validUpto.split("/").map(Number);
    const expiry = new Date(year, month - 1, day);
    expiry.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
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
    localStorage.setItem("userlogged", "false");
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-indigo-50">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-indigo-600 font-semibold text-sm">Loading…</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg px-6 text-center text-gray-600">
        Membership under review
      </div>
    );
  }

  const effectiveValidUpto = getEffectiveValidUpto(member);
  const days = getRemainingDays(effectiveValidUpto);
  const isExpired = days <= 0;
  const isExpiringSoon = !isExpired && days <= 30;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex md:flex-col w-64 bg-indigo-600 text-white p-6 shadow-xl shrink-0">
        <h2 className="text-2xl font-extrabold tracking-wide mb-10">
          Member Panel
        </h2>
        <nav className="space-y-3 flex-1">
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 font-semibold text-sm cursor-default">
            <HiChartBar className="text-lg shrink-0" />
            Dashboard
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-semibold text-sm"
          >
            <HiPencil className="text-lg shrink-0" />
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/80 hover:bg-red-500 transition font-semibold text-sm"
          >
            <HiLogout className="text-lg shrink-0" />
            Logout
          </button>
        </nav>
        {/* Member mini-card in sidebar */}
        <div className="mt-auto pt-4 border-t border-white/20">
          <div className="flex items-center gap-3">
            <img
              src={member.photo || "/default-avatar.png"}
              alt={member.name}
              className="w-10 h-10 rounded-full border-2 border-white/50 object-cover"
            />
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{member.nickname}</p>
              <p className="text-white/60 text-xs truncate">
                {member.membershipId?.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE: STICKY TOP BAR ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-indigo-600 text-white shadow-lg">
        <div className="flex items-center gap-3 px-4 py-3">
          <img
            src={member.photo || "/default-avatar.png"}
            alt={member.name}
            className="w-9 h-9 rounded-full border-2 border-white/60 object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate leading-tight">
              {member.nickname}
            </p>
            <p className="text-white/70 text-xs truncate">
              {member.membershipId?.toUpperCase()}
            </p>
          </div>
          {/* Days badge */}
          <div
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${
              isExpired
                ? "bg-red-500 text-white"
                : isExpiringSoon
                  ? "bg-amber-400 text-amber-900"
                  : "bg-white/20 text-white"
            }`}
          >
            {isExpired ? "Expired" : `${days}d left`}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 pb-24 md:pb-8 pt-[20px] md:pt-0 px-0 md:p-6 space-y-0 md:space-y-6 overflow-x-hidden">
        {/* ── ANNOUNCEMENT BANNER with marquee + glow animations ── */}
        <style>{`
  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }
  @keyframes bannerPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.0); }
    50%       { box-shadow: 0 0 18px 4px rgba(99,102,241,0.55); }
  }
  @keyframes voteBtnGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.0); }
    50%       { box-shadow: 0 0 10px 3px rgba(255,255,255,0.7); }
  }
  @keyframes speakerBounce {
    0%, 100% { transform: rotate(-8deg) scale(1); }
    50%       { transform: rotate(8deg) scale(1.2); }
  }
  .banner-marquee {
    display: inline-block;
    white-space: nowrap;
  }
  @media (max-width: 768px) {
    .banner-marquee {
      animation: marquee 10s linear infinite;
    }
  }
  .banner-glow {
    animation: bannerPulse 2.4s ease-in-out infinite;
  }
  .vote-btn-glow {
    animation: voteBtnGlow 1.8s ease-in-out infinite;
  }
  .speaker-bounce {
    display: inline-block;
    animation: speakerBounce 1s ease-in-out infinite;
  }
`}</style>

        <div className="mx-3 mt-3 md:mx-0 md:mt-0 banner-glow bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-between gap-2 px-4 py-3 overflow-hidden">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <span className="speaker-bounce shrink-0">
              <HiSpeakerphone className="text-white text-lg" />
            </span>
            {/* Marquee wrapper */}
            <div className="overflow-hidden flex-1">
              <div className="flex w-max">
                <span className="banner-marquee text-white text-xs font-semibold leading-snug pr-16">
                  KINGSTAR INTERNATIONAL COUNCIL ELECTION 2026-27 
                </span>
                <span
                  className="banner-marquee text-white text-xs font-semibold leading-snug pr-16"
                >
                  KINGSTAR INTERNATIONAL COUNCIL ELECTION 2026-27 
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/vote")}
            className="vote-btn-glow shrink-0 flex items-center gap-1 bg-white/25 border border-white/40 text-white text-xs font-bold px-3 py-1.5 rounded-full active:bg-white/40 transition"
          >
            <HiCheckCircle className="text-sm" />
            Vote
          </button>
        </div>

        {/* ── MOBILE PROFILE HERO ── */}
        <div className="md:hidden mx-3 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Gradient bar */}
          <div className="h-10 bg-gradient-to-br from-indigo-400 to-blue-500" />
          <div className="px-4 pb-4 -mt-6">
            <div className="flex items-end gap-3 mb-3">
              <div className="relative">
                <img
                  src={member.photo || "/default-avatar.png"}
                  alt={member.name}
                  className="w-20 h-20 rounded-full border-3 border-white shadow-md object-cover"
                />
              </div>
              <div className="pb-1 min-w-0 flex-1">
                <h1 className="text-lg font-extrabold text-gray-900 uppercase tracking-wide truncate leading-tight">
                  {member.name}
                </h1>
                <p className="text-gray-500 text-xs">{member.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                {member.membershipId?.toUpperCase()}
              </span>
              {member.nri === "Yes" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  <HiGlobe className="text-sm" />
                  NRI
                </span>
              )}
              {member.membershipStatus === "approved" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  <HiBadgeCheck className="text-sm" />
                  Approved
                </span>
              )}
            </div>

            {/* Validity strip */}
            <div
              className={`mt-3 flex items-center justify-between rounded-xl px-3 py-2.5 ${
                isExpired
                  ? "bg-red-50 border border-red-200"
                  : isExpiringSoon
                    ? "bg-amber-50 border border-amber-200"
                    : "bg-indigo-50 border border-indigo-200"
              }`}
            >
              <div>
                <p
                  className={`text-xs font-medium ${isExpired ? "text-red-500" : isExpiringSoon ? "text-amber-600" : "text-indigo-500"}`}
                >
                  Valid until
                </p>
                <p
                  className={`text-sm font-bold ${isExpired ? "text-red-700" : isExpiringSoon ? "text-amber-700" : "text-indigo-700"}`}
                >
                  {effectiveValidUpto}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-2xl font-extrabold leading-none ${isExpired ? "text-red-600" : isExpiringSoon ? "text-amber-500" : "text-indigo-600"}`}
                >
                  {isExpired ? "0" : days}
                </p>
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wider ${isExpired ? "text-red-400" : isExpiringSoon ? "text-amber-400" : "text-indigo-400"}`}
                >
                  {isExpired ? "Expired" : "Days Left"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── DESKTOP PROFILE CARD ── */}
        <div className="hidden md:flex items-center justify-around rounded-3xl shadow-xl bg-white p-6 transition-all hover:shadow-2xl">
          <div className="flex gap-16 items-center">
            <div
              className={`flex flex-col items-center justify-center rounded-2xl px-5 py-4 shadow-md min-w-[110px] ${
                isExpired
                  ? "bg-red-50 border border-red-200"
                  : isExpiringSoon
                    ? "bg-amber-50 border border-amber-200"
                    : "bg-indigo-50 border border-indigo-200"
              }`}
            >
              <div className="flex items-center gap-1">
                <span
                  className={`text-xl font-extrabold leading-none ${isExpired ? "text-red-600" : isExpiringSoon ? "text-amber-500" : "text-indigo-600"}`}
                >
                  {isExpired ? "0" : days}
                </span>
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wide mt-1 ${isExpired ? "text-red-400" : isExpiringSoon ? "text-amber-400" : "text-indigo-400"}`}
                >
                  {isExpired ? "Expired" : "Days Left"}
                </span>
              </div>
              <span
                className={`text-[10px] mt-1 ${isExpired ? "text-red-300" : isExpiringSoon ? "text-amber-300" : "text-indigo-300"}`}
              >
                Valid: {effectiveValidUpto}
              </span>
            </div>
          </div>
          <img
            src={member.photo || "/default-avatar.png"}
            alt={member.name}
            className="w-40 h-40 rounded-full border-4 border-indigo-500 object-cover shadow-md"
          />
          <div className="text-center">
            <h1 className="text-xl font-extrabold uppercase text-indigo-600 tracking-wide">
              {member.nickname}
            </h1>
            {member.nri === "Yes" && (
              <span className="inline-flex items-center gap-1 py-1 text-lg font-bold text-green-700">
                <HiGlobe className="text-xl" />
                NRI
              </span>
            )}
            <p className="text-gray-600 mt-1 text-lg">{member.phone}</p>
            <span className="inline-block mt-2 px-3 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700">
              {member.membershipId?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* ── MEMBERSHIP CARD ── */}
        {member.membershipStatus === "approved" && (
          <div className="mx-3 mt-4 sm:mt-0 md:mx-0 rounded-2xl md:rounded-3xl shadow-sm md:shadow-xl bg-white p-3 flex flex-col items-center overflow-x-auto">
            <MembershipCard user={member} />
          </div>
        )}

        {/* ── MEMBER DETAILS ── */}
        <div className="mx-3 md:mx-0 bg-white rounded-2xl md:rounded-3xl shadow-sm md:shadow-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <h2 className="text-lg md:text-2xl font-bold text-indigo-700">
              Member Details
            </h2>
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white sm:text-sm text-xs font-semibold hover:bg-indigo-600 transition-all"
            >
              <HiPencil className="sm:text-base" />
              Edit Profile
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2.5 md:gap-5 text-sm">
            <Detail label="Full Name" value={member.name} />
            <Detail label="Father's Name" value={member.fatherName} />
            <Detail label="Membership ID" value={member.membershipId} />
            <Detail label="Phone" value={member.phone} />
            <Detail label="WhatsApp" value={member.whatsapp} />
            <Detail label="Blood Group" value={member.bloodGroup || "N/A"} />
            <Detail label="Aadhaar" value={maskAadhaar(member.aadhaar)} />
            <Detail label="Email" value={member.email || "N/A"} />
            <Detail label="Age" value={member.age} />
            <Detail label="NRI" value={member.nri || "No"} />
            <Detail label="Valid Upto" value={effectiveValidUpto} />
            <Detail
              label="Joined On"
              value={new Date(member.createdAt).toLocaleDateString()}
            />
            <div className="col-span-2">
              <Detail label="Address" value={member.address} />
            </div>
          </div>
        </div>

        <div className="h-2 md:hidden" />
      </main>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          <TabBtn
            icon={<HiHome className="text-xl" />}
            label="Home"
            active={activeTab === "home"}
            onClick={() => setActiveTab("home")}
          />
          <TabBtn
            icon={<HiSparkles className="text-xl" />}
            label="Activities"
            active={false}
            onClick={() => navigate("/activities")}
          />
          <TabBtn
            icon={<HiUserGroup className="text-xl" />}
            label="Members"
            active={false}
            onClick={() => navigate("/committee")}
          />
          <TabBtn
            icon={<HiInformationCircle className="text-xl" />}
            label="About"
            active={false}
            onClick={() => navigate("/about")}
          />
          <TabBtn
            icon={<HiLogout className="text-xl" />}
            label="Logout"
            active={false}
            danger
            onClick={handleLogout}
          />
        </div>
      </nav>

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

/* ── Tab button helper ── */
function TabBtn({ icon, label, active, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[52px] rounded-xl transition-all active:scale-95 ${
        active ? "text-indigo-600" : danger ? "text-red-500" : "text-gray-500"
      }`}
    >
      {icon}
      <span
        className={`text-[10px] font-semibold ${active ? "text-indigo-600" : danger ? "text-red-500" : "text-gray-500"}`}
      >
        {label}
      </span>
      {active && (
        <span className="w-4 h-0.5 rounded-full bg-indigo-600 mt-0.5" />
      )}
    </button>
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
  const [cropSrc, setCropSrc] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

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
      {/* ── MOBILE: full-screen sheet ── */}
      <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-4 py-3 flex items-center gap-3 shrink-0 safe-area-top">
          <button
            onClick={onClose}
            className="text-white/80 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <HiArrowLeft className="text-xl" />
          </button>
          <h2 className="text-white font-bold text-base flex-1">
            Edit Profile
          </h2>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-white text-indigo-600 font-bold text-sm px-4 py-2 rounded-full min-h-[36px] disabled:opacity-60 active:bg-indigo-50 transition flex items-center gap-1.5"
          >
            <HiSave className="text-base" />
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <MobileEditBody
            form={form}
            handleChange={handleChange}
            photoPreview={photoPreview}
            photoFile={photoFile}
            fileInputRef={fileInputRef}
            handlePhotoChange={handlePhotoChange}
            error={error}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </div>
      </div>

      {/* ── DESKTOP: centred modal ── */}
      <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b flex items-center justify-between z-10">
            <h2 className="text-2xl font-extrabold text-indigo-700">
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <HiX className="text-2xl" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {/* Photo */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-indigo-400 object-cover shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition"
                >
                  <HiCamera className="text-base" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-100 text-indigo-700 text-sm font-semibold hover:bg-indigo-200 transition"
              >
                <HiCamera className="text-base" />
                Change Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              {photoFile && (
                <p className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <HiCheck className="text-sm" />
                  New photo ready
                </p>
              )}
            </div>

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
              {/* Password field with eye toggle — desktop */}
              <PasswordField
                label="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                desktop
              />
              <SelectField
                label="Blood Group"
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                options={[
                  "A+",
                  "A-",
                  "B+",
                  "B-",
                  "O+",
                  "O-",
                  "AB+",
                  "AB-",
                  "Nil",
                ]}
              />
              <SelectField
                label="NRI Status"
                name="nri"
                value={form.nri}
                onChange={handleChange}
                options={["No", "Yes"]}
              />
            </div>

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
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                <HiExclamationCircle className="text-lg shrink-0" />
                {error}
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
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <HiSave className="text-base" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

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

/* Mobile edit form body */
function MobileEditBody({
  form,
  handleChange,
  photoPreview,
  photoFile,
  fileInputRef,
  handlePhotoChange,
  error,
  showPassword,
  setShowPassword,
}) {
  return (
    <div className="px-4 py-5 space-y-5">
      {/* Photo */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <img
            src={photoPreview}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-indigo-400 object-cover shadow-md"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg"
          >
            <HiCamera className="text-sm" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="flex items-center gap-1 text-indigo-600 text-sm font-semibold underline underline-offset-2"
        >
          <HiCamera className="text-base" />
          Change Photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
        {photoFile && (
          <p className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <HiCheck className="text-sm" />
            New photo selected
          </p>
        )}
      </div>

      {/* Section: Personal */}
      <SectionLabel label="Personal Info" />
      <MobileField
        label="Full Name"
        name="name"
        value={form.name}
        onChange={handleChange}
      />
      <MobileField
        label="Father's Name"
        name="fatherName"
        value={form.fatherName}
        onChange={handleChange}
      />
      <MobileField
        label="Nickname"
        name="nickname"
        value={form.nickname}
        onChange={handleChange}
      />
      <MobileField
        label="Date of Birth"
        name="dob"
        type="date"
        value={form.dob}
        onChange={handleChange}
      />
      <MobileField
        label="Age"
        name="age"
        type="number"
        value={form.age}
        onChange={handleChange}
      />
      <MobileSelectField
        label="Blood Group"
        name="bloodGroup"
        value={form.bloodGroup}
        onChange={handleChange}
        options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Nil"]}
      />
      <MobileSelectField
        label="NRI Status"
        name="nri"
        value={form.nri}
        onChange={handleChange}
        options={["No", "Yes"]}
      />

      {/* Section: Contact */}
      <SectionLabel label="Contact" />
      <MobileField
        label="Phone"
        name="phone"
        type="tel"
        value={form.phone}
        onChange={handleChange}
      />
      <MobileField
        label="WhatsApp"
        name="whatsapp"
        type="tel"
        value={form.whatsapp}
        onChange={handleChange}
      />
      <MobileField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Address
        </label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={3}
          className="border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 resize-none"
        />
      </div>

      {/* Section: Account */}
      <SectionLabel label="Account" />
      <MobileField
        label="Aadhaar (12 digits)"
        name="aadhaar"
        value={form.aadhaar}
        onChange={handleChange}
        maxLength={12}
      />
      {/* Password with eye toggle — mobile */}
      <PasswordField
        label="Password"
        name="password"
        value={form.password}
        onChange={handleChange}
        show={showPassword}
        onToggle={() => setShowPassword((v) => !v)}
      />

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          <HiExclamationCircle className="text-lg shrink-0" />
          {error}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
        {label}
      </span>
      <div className="flex-1 h-px bg-indigo-100" />
    </div>
  );
}

function MobileField({
  label,
  name,
  value,
  onChange,
  type = "text",
  maxLength,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="border border-gray-200 rounded-xl px-3 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
      />
    </div>
  );
}

function MobileSelectField({ label, name, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="border border-gray-200 rounded-xl px-3 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ======================
   PASSWORD FIELD with eye toggle
====================== */
function PasswordField({
  label,
  name,
  value,
  onChange,
  show,
  onToggle,
  desktop,
}) {
  const baseInput = desktop
    ? "border border-indigo-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50 flex-1 min-w-0"
    : "border border-gray-200 rounded-xl px-3 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 flex-1 min-w-0";
  const labelClass = desktop
    ? "text-xs font-semibold text-indigo-600 uppercase tracking-wide"
    : "text-xs font-semibold text-gray-500 uppercase tracking-wide";

  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-0">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className={baseInput}
          style={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderRight: "none",
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          className={`flex items-center justify-center px-3 h-full border focus:outline-none transition-colors ${
            desktop
              ? "border-indigo-200 bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded-r-xl"
              : "border-gray-200 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-r-xl"
          }`}
          style={{ minHeight: desktop ? "38px" : "50px", borderLeft: "none" }}
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <HiEyeOff className="text-lg" />
          ) : (
            <HiEye className="text-lg" />
          )}
        </button>
      </div>
    </div>
  );
}

/* ======================
   HELPERS
====================== */
function Detail({ label, value }) {
  return (
    <div className="bg-indigo-50 rounded-xl p-3 md:p-4 hover:bg-indigo-100 transition-all duration-200 shadow-sm">
      <p className="text-indigo-500 text-[10px] md:text-xs font-semibold uppercase tracking-wide">
        {label}
      </p>
      <p className="font-semibold text-gray-800 text-xs md:text-sm mt-0.5 break-words">
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

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="border border-indigo-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
