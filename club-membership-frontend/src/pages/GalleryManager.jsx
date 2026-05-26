// components/admin/GalleryManager.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  RiImageLine,
  RiNewspaperLine,
  RiScissorsLine,
  RiAddLine,
  RiCloseLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckLine,
  RiAlertLine,
  RiGridLine,
  RiListCheck,
  RiArrowUpLine,
  RiArrowDownLine,
  RiImageAddLine,
  RiGalleryLine,
  RiLoader4Line,
  RiImage2Line,
} from "react-icons/ri";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const LABELS = [
  {
    value: "gallery",
    label: "Gallery",
    Icon: RiGalleryLine,
    pill: "bg-teal-50 text-teal-700 border-teal-200",
    tab: "bg-teal-600 text-white border-teal-600",
    tabIdle: "bg-white text-teal-600 border-teal-200 hover:bg-teal-50",
    formActive: "bg-teal-50 border-teal-400 text-teal-700",
    formIdle: "bg-white border-stone-200 text-stone-400 hover:border-teal-300",
    cardBorder: "border-teal-200",
    cardGlow: "shadow-teal-100",
    dot: "bg-teal-500",
    btn: "bg-teal-600 hover:bg-teal-700 text-white",
    toggleOn: "bg-teal-500",
    dropActive: "border-teal-400 bg-teal-50",
    tagBg: "bg-teal-500",
  },
  {
    value: "newscutting",
    label: "News Cutting",
    Icon: RiScissorsLine,
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    tab: "bg-amber-500 text-white border-amber-500",
    tabIdle: "bg-white text-amber-600 border-amber-200 hover:bg-amber-50",
    formActive: "bg-amber-50 border-amber-400 text-amber-700",
    formIdle: "bg-white border-stone-200 text-stone-400 hover:border-amber-300",
    cardBorder: "border-amber-200",
    cardGlow: "shadow-amber-100",
    dot: "bg-amber-500",
    btn: "bg-amber-500 hover:bg-amber-600 text-white",
    toggleOn: "bg-amber-500",
    dropActive: "border-amber-400 bg-amber-50",
    tagBg: "bg-amber-500",
  },
  {
    value: "news",
    label: "News",
    Icon: RiNewspaperLine,
    pill: "bg-rose-50 text-rose-700 border-rose-200",
    tab: "bg-rose-600 text-white border-rose-600",
    tabIdle: "bg-white text-rose-600 border-rose-200 hover:bg-rose-50",
    formActive: "bg-rose-50 border-rose-400 text-rose-700",
    formIdle: "bg-white border-stone-200 text-stone-400 hover:border-rose-300",
    cardBorder: "border-rose-200",
    cardGlow: "shadow-rose-100",
    dot: "bg-rose-500",
    btn: "bg-rose-600 hover:bg-rose-700 text-white",
    toggleOn: "bg-rose-500",
    dropActive: "border-rose-400 bg-rose-50",
    tagBg: "bg-rose-500",
  },
];

const getLabelMeta = (v) => LABELS.find((l) => l.value === v) ?? LABELS[0];

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

/* ════════════════════════════════════
   TOAST SYSTEM
════════════════════════════════════ */
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium pointer-events-auto
            ${
              t.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-teal-50 border-teal-200 text-teal-800"
            }`}
          style={{ animation: "toastIn 0.25s ease", minWidth: 240 }}
        >
          {t.type === "error" ? (
            <RiAlertLine className="text-rose-500 shrink-0" size={16} />
          ) : (
            <RiCheckLine className="text-teal-500 shrink-0" size={16} />
          )}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);
  return { toasts, push };
}

/* ════════════════════════════════════
   CONFIRM DIALOG
════════════════════════════════════ */
function Confirm({ message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 border border-stone-100"
        style={{ animation: "slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
            <RiAlertLine size={18} className="text-rose-500" />
          </div>
          <div>
            <p className="font-semibold text-stone-800 text-sm mb-1">
              Delete Gallery?
            </p>
            <p className="text-stone-400 text-xs leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-stone-200 text-stone-500 text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   IMAGE PREVIEW THUMBNAILS
════════════════════════════════════ */
function ImageGrid({
  existingImages,
  newPreviews,
  onRemoveExisting,
  onRemoveNew,
}) {
  return (
    <div
      className="grid gap-2 mt-3"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}
    >
      {existingImages.map((img) => (
        <div
          key={img.publicId}
          className="relative rounded-lg overflow-hidden aspect-square bg-stone-100"
        >
          <img src={img.url} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onRemoveExisting(img.publicId)}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <RiCloseLine size={11} />
          </button>
          <span className="absolute bottom-1 left-1 text-[8px] font-bold uppercase tracking-wide bg-teal-500 text-white px-1.5 py-0.5 rounded">
            saved
          </span>
        </div>
      ))}
      {newPreviews.map(({ preview }, i) => (
        <div
          key={i}
          className="relative rounded-lg overflow-hidden aspect-square bg-stone-100"
        >
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onRemoveNew(i)}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <RiCloseLine size={11} />
          </button>
          <span className="absolute bottom-1 left-1 text-[8px] font-bold uppercase tracking-wide bg-amber-500 text-white px-1.5 py-0.5 rounded">
            new
          </span>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════
   GALLERY FORM MODAL
════════════════════════════════════ */
function GalleryForm({ existing, onSaved, onCancel, toast }) {
  const isEdit = Boolean(existing);
  const fileRef = useRef(null);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDesc] = useState(existing?.description ?? "");
  const [label, setLabel] = useState(existing?.label ?? "gallery");
  const [order, setOrder] = useState(existing?.order ?? 0);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [newFiles, setNewFiles] = useState([]);
  const [existImgs, setExistImgs] = useState(existing?.images ?? []);
  const [removedIds, setRemovedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [dragOn, setDragOn] = useState(false);

  useEffect(
    () => () => newFiles.forEach((f) => URL.revokeObjectURL(f.preview)),
    [newFiles],
  );

  const addFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setNewFiles((p) => [
      ...p,
      ...valid.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
    ]);
  };

  const removeExisting = (pid) => {
    setExistImgs((p) => p.filter((i) => i.publicId !== pid));
    setRemovedIds((p) => [...p, pid]);
  };
  const removeNew = (idx) => {
    setNewFiles((p) => {
      URL.revokeObjectURL(p[idx].preview);
      return p.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast("Title is required", "error");
    if (!isEdit && newFiles.length === 0)
      return toast("Add at least one image", "error");
    if (isEdit && existImgs.length === 0 && newFiles.length === 0)
      return toast("Gallery must have at least one image", "error");

    setSaving(true);
    try {
      if (isEdit && removedIds.length) {
        await Promise.allSettled(
          removedIds.map((pid) =>
            axios.patch(
              `${API}/api/admin/galleries/${existing._id}/images/${encodeURIComponent(pid)}`,
              {},
              authHeader(),
            ),
          ),
        );
      }

      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("label", label);
      form.append("order", order);
      form.append("isActive", isActive);
      newFiles.forEach(({ file }) => form.append("images", file));

      if (isEdit) {
        await axios.put(
          `${API}/api/admin/galleries/${existing._id}`,
          form,
          authHeader(),
        );
      } else {
        await axios.post(`${API}/api/admin/galleries`, form, authHeader());
      }
      onSaved();
    } catch (err) {
      toast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const meta = getLabelMeta(label);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-stone-100"
        style={{ animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-stone-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-stone-400 mb-1">
              {isEdit ? "Editing Entry" : "New Entry"}
            </p>
            <h2 className="text-xl font-bold text-stone-800">
              {isEdit ? existing.title : "Create Gallery"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-5">
          {/* Label selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2.5">
              Category
            </label>
            <div className="flex gap-2.5">
              {LABELS.map(
                ({ value, label: lbl, Icon, formActive, formIdle }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLabel(value)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 text-xs font-semibold transition-all duration-150
                    ${label === value ? formActive : formIdle}`}
                  >
                    <Icon size={13} />
                    {lbl}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title…"
              maxLength={150}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
            />
            <p className="text-right text-[10px] text-stone-300 mt-1">
              {title.length}/150
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
              Description{" "}
              <span className="text-[10px] font-normal normal-case tracking-normal text-stone-300">
                (optional)
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="A short description for this gallery entry…"
              maxLength={600}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition resize-none"
            />
            <p className="text-right text-[10px] text-stone-300 mt-1">
              {description.length}/600
            </p>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
              Images <span className="text-rose-400">*</span>
              {isEdit && (
                <span className="ml-2 font-normal normal-case tracking-normal text-[10px] text-stone-300">
                  upload new to add more
                </span>
              )}
            </label>

            <div
              onDragEnter={() => setDragOn(true)}
              onDragLeave={() => setDragOn(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setDragOn(false);
                addFiles(e.dataTransfer.files);
              }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl py-8 px-4 flex flex-col items-center cursor-pointer transition-all duration-150
                ${dragOn ? meta.dropActive : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-stone-100"}`}
            >
              <RiImageAddLine
                size={28}
                className={dragOn ? "text-teal-500" : "text-stone-300"}
              />
              <p className="text-sm text-stone-500 mt-2.5">
                Drag & drop or{" "}
                <span className="font-semibold text-teal-600">
                  browse files
                </span>
              </p>
              <p className="text-xs text-stone-300 mt-1">
                JPG · PNG · WebP · GIF — 10 MB max
              </p>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {(existImgs.length > 0 || newFiles.length > 0) && (
              <ImageGrid
                existingImages={existImgs}
                newPreviews={newFiles}
                onRemoveExisting={removeExisting}
                onRemoveNew={removeNew}
              />
            )}
          </div>

          {/* Order + Visibility */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                Display Order
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOrder((o) => Math.max(0, o - 1))}
                  className="w-9 h-9 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-400 transition-colors"
                >
                  <RiArrowDownLine size={14} />
                </button>
                <input
                  type="number"
                  min={0}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-16 text-center px-2 py-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setOrder((o) => o + 1)}
                  className="w-9 h-9 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-400 transition-colors"
                >
                  <RiArrowUpLine size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                Visibility
              </label>
              <div
                onClick={() => setIsActive((v) => !v)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all duration-150
                  ${isActive ? "border-teal-200 bg-teal-50" : "border-stone-200 bg-white"}`}
              >
                {/* Toggle track */}
                <div
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0
                  ${isActive ? "bg-teal-500" : "bg-stone-200"}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200
                    ${isActive ? "left-[18px]" : "left-0.5"}`}
                  />
                </div>
                <span
                  className={`text-xs font-bold tracking-wide ${isActive ? "text-teal-700" : "text-stone-400"}`}
                >
                  {isActive ? "ACTIVE" : "HIDDEN"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-semibold hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 ${meta.btn}`}
            >
              {saving ? (
                <>
                  <RiLoader4Line className="animate-spin" size={14} /> Saving…
                </>
              ) : (
                <>
                  <RiCheckLine size={14} />{" "}
                  {isEdit ? "Save Changes" : "Create Gallery"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   ACTION BUTTON (card footer)
════════════════════════════════════ */
function ActionBtn({ icon, label, hoverClass, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] font-semibold text-stone-400 transition-all duration-150 ${hoverClass}`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ════════════════════════════════════
   GALLERY CARD
════════════════════════════════════ */
function GalleryCard({ gallery, onEdit, onDelete, onToggle }) {
  const meta = getLabelMeta(gallery.label);
  const { Icon } = meta;

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg
      ${gallery.isActive ? `border-stone-200 hover:${meta.cardBorder} hover:${meta.cardGlow}` : "border-stone-200 opacity-70"}`}
    >
      {/* Image strip */}
      <div className="h-40 flex relative overflow-hidden bg-stone-100">
        {gallery.images.slice(0, 4).map((img, i) => (
          <img
            key={img.publicId}
            src={img.url}
            alt=""
            className={`flex-1 object-cover min-w-0 border-r-2 border-white last:border-0
              ${!gallery.isActive ? "grayscale brightness-75" : ""}`}
            style={{ transition: "filter 0.2s" }}
          />
        ))}
        {gallery.images.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <RiImage2Line size={32} className="text-stone-300" />
          </div>
        )}
        {gallery.images.length > 4 && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
            +{gallery.images.length - 4}
          </div>
        )}

        {/* Label badge */}
        <div
          className={`absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${meta.pill}`}
        >
          <Icon size={10} />
          {gallery.label}
        </div>

        {/* Hidden badge */}
        {!gallery.isActive && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/80 text-stone-500 text-[9px] font-bold uppercase tracking-widest border border-stone-200">
            Hidden
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-bold text-stone-800 leading-snug line-clamp-2 flex-1">
            {gallery.title}
          </h3>
          <span className="text-[10px] text-stone-300 shrink-0 font-medium mt-0.5">
            {gallery.images.length} img{gallery.images.length !== 1 ? "s" : ""}
          </span>
        </div>
        {gallery.description && (
          <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
            {gallery.description}
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex border-t border-stone-100 px-3 py-2 gap-1">
        <ActionBtn
          icon={<RiEditLine size={12} />}
          label="Edit"
          hoverClass="hover:bg-violet-50 hover:text-violet-600"
          onClick={() => onEdit(gallery)}
        />
        <ActionBtn
          icon={
            gallery.isActive ? (
              <RiEyeOffLine size={12} />
            ) : (
              <RiEyeLine size={12} />
            )
          }
          label={gallery.isActive ? "Hide" : "Show"}
          hoverClass="hover:bg-amber-50 hover:text-amber-600"
          onClick={() => onToggle(gallery._id)}
        />
        <ActionBtn
          icon={<RiDeleteBinLine size={12} />}
          label="Delete"
          hoverClass="hover:bg-rose-50 hover:text-rose-600"
          onClick={() => onDelete(gallery._id)}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   MAIN PAGE
════════════════════════════════════ */
export default function GalleryManager() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLabel, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [formState, setFormState] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { toasts, push: toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = filterLabel !== "all" ? `?label=${filterLabel}` : "";
      const { data } = await axios.get(
        `${API}/api/admin/galleries${q}`,
        authHeader(),
      );
      setGalleries(data.data || []);
    } catch {
      toast("Failed to load galleries", "error");
    } finally {
      setLoading(false);
    }
  }, [filterLabel]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (id) => {
    try {
      const { data } = await axios.patch(
        `${API}/api/admin/galleries/${id}/toggle`,
        {},
        authHeader(),
      );
      toast(`Gallery ${data.data.isActive ? "activated" : "hidden"}`);
      load();
    } catch (err) {
      toast(err.response?.data?.message || "Toggle failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/api/admin/galleries/${confirm}`, authHeader());
      toast("Gallery deleted");
      setConfirm(null);
      load();
    } catch (err) {
      toast(err.response?.data?.message || "Delete failed", "error");
      setConfirm(null);
    }
  };

  const filterCounts = {};
  LABELS.forEach(({ value }) => {
    filterCounts[value] = galleries.filter((g) => g.label === value).length;
  });
  const displayed =
    filterLabel === "all"
      ? galleries
      : galleries.filter((g) => g.label === filterLabel);

  const ALL_FILTERS = [
    {
      value: "all",
      label: "All",
      Icon: RiImageLine,
      tab: "bg-stone-800 text-white border-stone-800",
      tabIdle: "bg-white text-stone-600 border-stone-200 hover:bg-stone-50",
    },
    ...LABELS,
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .font-syne { font-family: 'Syne', sans-serif; }
        .line-clamp-2 { display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
      `}</style>

      <div className="min-h-screen bg-stone-50 px-6 py-10 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* ── Page header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-0.5 h-7 rounded-full bg-gradient-to-b from-teal-500 to-violet-500" />
                <span className="text-[10px] font-bold tracking-[3px] text-stone-400 uppercase">
                  Admin / Media
                </span>
              </div>
              <h1 className="text-4xl font-bold text-stone-900 leading-none font-syne">
                Gallery
              </h1>
              <p className="text-stone-400 text-sm mt-2">
                {galleries.length} entr{galleries.length !== 1 ? "ies" : "y"}{" "}
                across all categories
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                {[
                  { mode: "grid", Icon: RiGridLine },
                  { mode: "list", Icon: RiListCheck },
                ].map(({ mode, Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3.5 py-2.5 transition-colors ${viewMode === mode ? "bg-stone-100 text-stone-700" : "bg-white text-stone-300 hover:text-stone-500"}`}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setFormState("create")}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
              >
                <RiAddLine size={16} />
                New Entry
              </button>
            </div>
          </div>

          {/* ── Filter tabs ── */}
          <div className="flex flex-wrap gap-2 mb-8">
            {ALL_FILTERS.map(({ value, label: lbl, Icon, tab, tabIdle }) => {
              const active = filterLabel === value;
              const count =
                value === "all" ? galleries.length : (filterCounts[value] ?? 0);
              return (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all duration-150 shadow-sm
                    ${active ? tab : tabIdle}`}
                >
                  <Icon size={12} />
                  {lbl}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                    ${active ? "bg-white/20 text-inherit" : "bg-stone-100 text-stone-400"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-stone-300">
              <RiLoader4Line size={32} className="animate-spin text-teal-500" />
              <p className="text-xs tracking-widest uppercase font-medium">
                Loading galleries…
              </p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center">
                <RiGalleryLine size={36} className="text-stone-300" />
              </div>
              <p className="text-stone-400 text-sm font-medium">
                No galleries found
              </p>
              <button
                onClick={() => setFormState("create")}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <RiAddLine size={15} /> Create First Entry
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
              }}
            >
              {displayed.map((g) => (
                <GalleryCard
                  key={g._id}
                  gallery={g}
                  onEdit={setFormState}
                  onDelete={setConfirm}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          ) : (
            /* ── List view ── */
            <div className="flex flex-col gap-3">
              {displayed.map((g) => {
                const meta = getLabelMeta(g.label);
                return (
                  <div
                    key={g._id}
                    className="flex items-center gap-4 bg-white border border-stone-200 rounded-2xl p-3.5 hover:border-stone-300 hover:shadow-sm transition-all duration-150"
                  >
                    {/* Thumb */}
                    <div className="w-16 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                      {g.images[0] ? (
                        <img
                          src={g.images[0].url}
                          alt=""
                          className={`w-full h-full object-cover ${!g.isActive ? "grayscale" : ""}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <RiImage2Line className="text-stone-300" size={18} />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="text-sm font-bold text-stone-800 truncate">
                          {g.title}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wide ${meta.pill}`}
                        >
                          {g.label}
                        </span>
                        {!g.isActive && (
                          <span className="px-2 py-0.5 rounded-full border border-stone-200 text-[9px] font-bold uppercase tracking-wide text-stone-400">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400">
                        {g.images.length} image
                        {g.images.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => setFormState(g)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-400 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                      >
                        <RiEditLine size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleToggle(g._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                      >
                        {g.isActive ? (
                          <RiEyeOffLine size={13} />
                        ) : (
                          <RiEyeLine size={13} />
                        )}
                        {g.isActive ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => setConfirm(g._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <RiDeleteBinLine size={13} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {formState && (
        <GalleryForm
          existing={formState === "create" ? null : formState}
          onSaved={() => {
            setFormState(null);
            toast(
              formState === "create" ? "Gallery created" : "Gallery updated",
            );
            load();
          }}
          onCancel={() => setFormState(null)}
          toast={toast}
        />
      )}

      {confirm && (
        <Confirm
          message="This will permanently delete the gallery and all its images from Cloudinary. This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      <Toast toasts={toasts} />
    </>
  );
}
