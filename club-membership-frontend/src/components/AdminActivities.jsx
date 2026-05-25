// pages/admin/AdminActivities.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Loader2,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Upload,
  XCircle,
} from "lucide-react";

const API = `${import.meta.env.VITE_BACKEND_URL}/api/admin/activities`;

const getToken = () => localStorage.getItem("adminToken");
const authHeaders = (isMultipart = false) => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    ...(isMultipart ? { "Content-Type": "multipart/form-data" } : {}),
  },
});

/* ── Toast ── */
function Toast({ toast, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium
        ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"}`}
    >
      {toast.type === "success" ? (
        <CheckCircle2 size={18} />
      ) : (
        <AlertCircle size={18} />
      )}
      {toast.message}
    </motion.div>
  );
}

/* ── Confirm dialog ── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
      >
        <div className="text-4xl mb-4">🗑️</div>
        <p className="text-gray-700 font-medium mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Image Upload Field ── */
function ImageUploadField({ existingImageUrl, onFileChange, onClear }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(existingImageUrl || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileChange(file);
  };

  const handleInputChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleClear = () => {
    setPreview(null);
    onClear();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
        Image
      </label>

      {preview ? (
        /* ── Preview state ── */
        <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-gray-200 group">
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-cover"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-full hover:bg-gray-100 transition"
            >
              <Upload size={13} /> Change
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-red-600 transition"
            >
              <XCircle size={13} /> Remove
            </button>
          </div>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
            ${
              isDragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50"
            }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
            ${isDragging ? "bg-blue-100" : "bg-gray-100"}`}
          >
            <ImageIcon
              size={20}
              className={isDragging ? "text-blue-500" : "text-gray-400"}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600">
              Drop image here or <span className="text-blue-500">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              PNG, JPG, WEBP up to 5MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

/* ── Activity Form Modal ── */
const emptyForm = {
  title: "",
  description: "",
  tag: "",
  date: "",
  order: 0,
  isActive: true,
};

function ActivityModal({ activity, onClose, onSaved }) {
  const [form, setForm] = useState(
    activity
      ? {
          title: activity.title,
          description: activity.description,
          tag: activity.tag || "",
          date: activity.date ? activity.date.slice(0, 10) : "", // slice to YYYY-MM-DD for input
          order: activity.order ?? 0,
          isActive: activity.isActive,
        }
      : emptyForm,
  );
  // imageFile: new File to upload | null = no change / keep existing
  const [imageFile, setImageFile] = useState(null);
  // clearImage: true = user explicitly removed the existing image
  const [clearImage, setClearImage] = useState(false);

  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const isEdit = !!activity?._id;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.tag.trim() ||
      !form.date
    ) {
      setFieldError("Title, description, tag and date are required.");
      return;
    }
    setSaving(true);
    try {
      // Always use FormData so the backend multer middleware works
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("tag", form.tag.trim());
      fd.append("date", form.date);
      fd.append("order", Number(form.order));
      fd.append("isActive", form.isActive);

      if (imageFile) {
        // New image selected — send it
        fd.append("image", imageFile);
      } else if (clearImage) {
        // User removed the image — signal backend to clear it
        fd.append("clearImage", "true");
      }
      // Otherwise (no change) — don't append "image" at all; backend keeps existing

      const { data } = isEdit
        ? await axios.put(`${API}/${activity._id}`, fd, authHeaders(true))
        : await axios.post(API, fd, authHeaders(true));

      if (!data.success) throw new Error(data.message);
      onSaved(data.data, isEdit);
    } catch (err) {
      setFieldError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 20 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? "Edit Event" : "Add New Event"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="px-7 py-6 space-y-4 max-h-[75vh] overflow-y-auto"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Community Outreach"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Short description shown on the homepage card…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Date *
            </label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            />
          </div>

          {/* Tag + Order row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Tag *
              </label>
              <input
                name="tag"
                value={form.tag}
                onChange={handleChange}
                placeholder="e.g. Social"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Order
              </label>
              <input
                name="order"
                type="number"
                min={0}
                value={form.order}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Image upload */}
          <ImageUploadField
            existingImageUrl={activity?.image || null}
            onFileChange={(file) => {
              setImageFile(file);
              setClearImage(false);
            }}
            onClear={() => {
              setImageFile(null);
              setClearImage(true);
            }}
          />

          {/* isActive toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Visible on Homepage
              </p>
              <p className="text-xs text-gray-400">
                Toggle off to hide without deleting
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
              className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5
                ${form.isActive ? "bg-blue-500" : "bg-gray-300"}`}
            >
              <motion.div
                className="w-5 h-5 rounded-full bg-white shadow"
                animate={{ x: form.isActive ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {fieldError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <AlertCircle size={14} /> {fieldError}
            </p>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API, authHeaders());
      if (!data.success) throw new Error(data.message);
      setActivities(data.data);
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSaved = (saved, isEdit) => {
    setActivities((prev) =>
      isEdit
        ? prev.map((a) => (a._id === saved._id ? saved : a))
        : [saved, ...prev],
    );
    setModal(null);
    showToast(isEdit ? "Event updated!" : "Event added!");
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await axios.patch(
        `${API}/${id}/toggle`,
        {},
        authHeaders(),
      );
      if (!data.success) throw new Error(data.message);
      setActivities((prev) => prev.map((a) => (a._id === id ? data.data : a)));
      showToast(data.message);
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    }
  };

  const handleDelete = async () => {
    try {
      const { data } = await axios.delete(`${API}/${confirm}`, authHeaders());
      if (!data.success) throw new Error(data.message);
      setActivities((prev) => prev.filter((a) => a._id !== confirm));
      showToast("Event deleted.");
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 px-5 sm:px-8 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Events
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {activities.length} total ·{" "}
              {activities.filter((a) => a.isActive).length} visible on homepage
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModal("add")}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-md shadow-blue-200 hover:bg-blue-700 transition"
          >
            <Plus size={16} /> Add Event
          </motion.button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse"
              >
                <div className="h-40 bg-gray-100" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-50 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && activities.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">📋</p>
            <p className="font-medium">No activities yet.</p>
            <p className="text-sm mt-1">
              Click Add Event to create your first one.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && activities.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {activities.map((act) => (
                <motion.div
                  key={act._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className={`bg-white rounded-3xl overflow-hidden shadow-sm border transition-all duration-200
                    ${
                      act.isActive
                        ? "border-gray-100"
                        : "border-dashed border-gray-200 opacity-60"
                    }`}
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    {act.image ? (
                      <img
                        src={act.image}
                        alt={act.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={36} />
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full
                        ${
                          act.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {act.isActive ? "Active" : "Hidden"}
                    </span>
                    {act.tag && (
                      <span className="absolute top-3 left-3 text-xs font-semibold bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-blue-600">
                        {act.tag}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 leading-snug">
                        {act.title}
                      </h3>
                      <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                        #{act.order}
                      </span>
                    </div>
                    {act.date && (
                      <p className="text-xs text-blue-500 font-medium mb-1">
                        {new Date(act.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {act.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="px-5 pb-5 flex items-center gap-2">
                    <button
                      onClick={() => setModal(act)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleToggle(act._id)}
                      title={
                        act.isActive ? "Hide from homepage" : "Show on homepage"
                      }
                      className={`flex items-center justify-center w-10 h-10 rounded-xl border transition
                        ${
                          act.isActive
                            ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            : "border-gray-200 text-gray-400 hover:bg-gray-50"
                        }`}
                    >
                      {act.isActive ? (
                        <ToggleRight size={18} />
                      ) : (
                        <ToggleLeft size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => setConfirm(act._id)}
                      className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <ActivityModal
            activity={modal === "add" ? null : modal}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirm && (
          <ConfirmDialog
            message="Are you sure you want to delete this activity? This cannot be undone."
            onConfirm={handleDelete}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
