// admin/components/AdminLogoPanel.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const API  = `${BASE}/api/logo`;
const ACCEPTED = ".png,.jpg,.jpeg,.webp";
const MAX_MB = 5;

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

/* ── tiny helpers ─────────────────────────────────────────────────────────── */
const fileToPreview = (file) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.readAsDataURL(file);
  });

const cls = (...args) => args.filter(Boolean).join(" ");

/* ── Toast ────────────────────────────────────────────────────────────────── */
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={cls(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5",
        "rounded-2xl shadow-xl text-sm font-medium border backdrop-blur-sm",
        "animate-[slideUp_0.3s_ease]",
        type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-red-50 border-red-200 text-red-700"
      )}
    >
      <span>{type === "success" ? "✅" : "❌"}</span>
      <span>{msg}</span>
      <button onClick={onClose} className="ml-1 opacity-50 hover:opacity-100 text-lg leading-none">
        ×
      </button>
    </div>
  );
};

/* ── ConfirmModal ─────────────────────────────────────────────────────────── */
const ConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
      <div className="text-5xl mb-4">🗑️</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Logo?</h3>
      <p className="text-sm text-gray-500 mb-7">
        This will permanently remove the logo and its Cloudinary asset.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition shadow-md shadow-red-100"
        >
          Yes, delete
        </button>
      </div>
    </div>
  </div>
);

/* ── DropZone ─────────────────────────────────────────────────────────────── */
const DropZone = ({ preview, onChange, disabled }) => {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      alert("Only PNG, JPG, or WEBP files are accepted.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`File must be under ${MAX_MB} MB.`);
      return;
    }
    onChange(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cls(
        "relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden",
        "flex flex-col items-center justify-center min-h-[220px] group",
        dragging
          ? "border-blue-400 bg-blue-50 scale-[1.01]"
          : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {preview ? (
        <>
          <img
            src={preview}
            alt="Logo preview"
            className="max-h-40 max-w-[80%] object-contain rounded-xl shadow-sm"
          />
          <span className="mt-3 text-xs text-gray-400 group-hover:text-blue-500 transition">
            Click or drag to replace
          </span>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-500 text-2xl mb-3 group-hover:scale-110 transition-transform">
            🖼️
          </div>
          <p className="text-sm font-semibold text-gray-600">
            Drop your logo here
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG · JPG · WEBP · max {MAX_MB} MB</p>
        </>
      )}
    </div>
  );
};

/* ── Main Component ───────────────────────────────────────────────────────── */
const AdminLogoPanel = () => {
  // server state
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // form state
  const [file, setFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [altText, setAltText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // toast
  const [toast, setToast] = useState(null);
  const notify = (msg, type = "success") => setToast({ msg, type });

  /* ── fetch current logo ── */
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await axios.get(API);
        setLogo(res.data.data);
        setAltText(res.data.data.altText ?? "Logo");
      } catch (err) {
        if (err.response?.status !== 404) {
          setFetchError(err.response?.data?.message || err.message);
        }
        // 404 = no logo yet — that's fine, show upload form
      } finally {
        setLoading(false);
      }
    };
    fetchLogo();
  }, []);

  /* ── local preview when file changes ── */
  useEffect(() => {
    if (!file) { setLocalPreview(null); return; }
    fileToPreview(file).then(setLocalPreview);
  }, [file]);

  /* ── save (upload or update) ── */
  const handleSave = async () => {
    if (!logo && !file) {
      notify("Please select an image first.", "error");
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      if (file) form.append("logo", file);
      form.append("altText", altText);

      let res;
      if (logo) {
        res = await axios.patch(API, form, authHeader());
      } else {
        res = await axios.post(API, form, authHeader());
      }

      setLogo(res.data.data);
      setFile(null);
      setLocalPreview(null);
      notify(logo ? "Logo updated successfully!" : "Logo uploaded successfully!");
    } catch (err) {
      notify(err.response?.data?.message || "Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async () => {
    setConfirmDelete(false);
    setDeleting(true);
    try {
      await axios.delete(API, authHeader());
      setLogo(null);
      setAltText("");
      setFile(null);
      notify("Logo deleted.");
    } catch (err) {
      notify(err.response?.data?.message || "Delete failed.", "error");
    } finally {
      setDeleting(false);
    }
  };

  /* ── render ── */
  const isDirty = !!file || (logo && altText !== logo.altText);

  return (
    <>
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
      {confirmDelete && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6 sm:p-10">
        <div className="w-full max-w-lg">

          {/* ── Header ── */}
          <div className="mb-8">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-3">
              Admin Panel
            </span>
            <h1 className="text-2xl font-bold text-gray-900">Logo Manager</h1>
            <p className="text-sm text-gray-400 mt-1">
              Upload, replace, or remove the site logo.
            </p>
          </div>

          {/* ── Card ── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center py-10 text-gray-300 gap-3 animate-pulse">
                <div className="w-20 h-20 rounded-2xl bg-gray-100" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
            )}

            {/* Fetch error */}
            {!loading && fetchError && (
              <div className="text-center py-10">
                <p className="text-3xl mb-2">⚠️</p>
                <p className="text-sm text-red-500">{fetchError}</p>
              </div>
            )}

            {/* Main form */}
            {!loading && !fetchError && (
              <>
                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={cls(
                      "text-xs font-semibold px-3 py-1 rounded-full border",
                      logo
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    )}
                  >
                    {logo ? "✓ Logo active" : "⚠ No logo uploaded"}
                  </span>

                  {logo && (
                    <span className="text-xs text-gray-400">
                      Last updated:{" "}
                      {new Date(logo.updatedAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {/* Drop zone */}
                <DropZone
                  preview={localPreview || logo?.url}
                  onChange={setFile}
                  disabled={saving || deleting}
                />

                {/* Alt text */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    maxLength={120}
                    placeholder='e.g. "My Organisation Logo"'
                    disabled={saving || deleting}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {altText.length}/120
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving || deleting || !isDirty}
                    className={cls(
                      "flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm",
                      isDirty && !saving
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 shadow-md"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {saving
                      ? "Saving…"
                      : logo
                      ? "Update Logo"
                      : "Upload Logo"}
                  </button>

                  {logo && (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      disabled={saving || deleting}
                      className="px-5 py-3 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-40"
                    >
                      {deleting ? "Deleting…" : "Delete"}
                    </button>
                  )}
                </div>

                {file && (
                  <p className="text-xs text-center text-gray-400">
                    Selected: <span className="font-medium text-gray-600">{file.name}</span>{" "}
                    ({(file.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* slideUp keyframe */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default AdminLogoPanel;