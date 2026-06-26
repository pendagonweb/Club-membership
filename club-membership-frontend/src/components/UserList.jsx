import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";

// ─── Helper ──────────────────────────────────────────────────────────────────
const isJunior = (dob) => {
  if (!dob) return false;
  const birth = new Date(dob);
  if (isNaN(birth)) return false;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());
  if (!hasBirthdayPassed) age--;
  return age < 20;
};

// ─── PDF Export Modal ────────────────────────────────────────────────────────
const ALL_FIELDS = [
  { key: "photo", label: "Photo" },
  { key: "membershipId", label: "Membership ID" },
  { key: "name", label: "Name" },
  { key: "fatherName", label: "Father's Name" },
  { key: "nickname", label: "Nickname" },
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "dob", label: "Date of Birth" },
  { key: "bloodGroup", label: "Blood Group" },
  { key: "address", label: "Address" },
  { key: "place", label: "Place" },
  { key: "gender", label: "Gender" },
  { key: "membershipStatus", label: "Status" },
  { key: "designation", label: "Designation" },
  { key: "expiryDate", label: "Valid Upto" },
  { key: "paymentAmount", label: "Amount Paid" },
];

function ExportPdfModal({ users, onClose }) {
  const [selected, setSelected] = useState([
    "photo",
    "membershipId",
    "name",
    "phone",
    "designation",
    "expiryDate",
    "paymentAmount",
  ]);
  const [filterStatus, setFilterStatus] = useState("all");

  const toggle = (key) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...selected];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setSelected(next);
  };

  const moveDown = (idx) => {
    if (idx === selected.length - 1) return;
    const next = [...selected];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setSelected(next);
  };

  const toBase64 = (url) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });

  const exportPdf = async () => {
    if (selected.length === 0) {
      alert("Please select at least one field.");
      return;
    }

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });

    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    );

    const { jsPDF } = window.jspdf;

    const filteredUsers = (
      filterStatus === "all"
        ? users
        : filterStatus === "nri"
          ? users.filter((u) => u.nri === "Yes")
          : filterStatus === "junior"
            ? users.filter((u) => isJunior(u.dob))
            : users.filter((u) => u.membershipStatus === filterStatus)
    ).sort((a, b) =>
      String(a.membershipId || "").localeCompare(
        String(b.membershipId || ""),
        undefined,
        { numeric: true },
      ),
    );

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const PAGE_W = doc.internal.pageSize.getWidth();
    const PAGE_H = doc.internal.pageSize.getHeight();
    const MARGIN = 8;
    const GAP = 2.5;
    const COLS = 3;

    const HEADER_H = 14;
    const TILE_W = (PAGE_W - MARGIN * 2 - GAP * (COLS - 1)) / COLS;

    const hasPhoto = selected.includes("photo");
    const PHOTO_SIZE = hasPhoto ? 14 : 0;
    const textFields = selected.filter((k) => k !== "photo");
    const LINE_H = 3.4;
    const TILE_PADDING = 2;
    const DETAILS_X_OFFSET = hasPhoto ? PHOTO_SIZE + TILE_PADDING + 1.5 : 0;
    const DETAILS_W = TILE_W - TILE_PADDING * 2 - DETAILS_X_OFFSET;
    const textBlockH = textFields.length * LINE_H;
    const TILE_H =
      TILE_PADDING * 2 + Math.max(hasPhoto ? PHOTO_SIZE : 0, textBlockH);

    const photoMap = {};
    if (hasPhoto) {
      await Promise.all(
        filteredUsers.map(async (u) => {
          if (u.photo) {
            photoMap[u._id] = await toBase64(u.photo);
          }
        }),
      );
    }

    const fieldValue = (u, key) => {
      let val = u[key] ?? "—";
      if (key === "dob" && val && val !== "—") {
        val = new Date(val).toLocaleDateString();
      }
      if (key === "expiryDate") {
        const dateStr =
          val && val !== "—"
            ? new Date(val).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : new Date("2027-03-31").toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
        val = `Expiry: ${dateStr}`;
      }
      if (key === "paymentAmount" && val && val !== "—") {
        val = `Rs. ${val}`;
      }
      if (val === "" || val === null || val === undefined) val = "—";
      return String(val);
    };

    const drawPageHeader = (pageNum, totalPages) => {
      doc.setFontSize(13);
      doc.setFont(undefined, "bold");
      doc.text("Kingstar Arts & Sports Club – Member List", MARGIN, 11);
      doc.setFontSize(7.5);
      doc.setFont(undefined, "normal");
      doc.text(
        `Filter: ${filterStatus.toUpperCase()}   |   Total: ${filteredUsers.length}   |   Generated: ${new Date().toLocaleDateString()}`,
        MARGIN,
        15.5,
      );
      doc.setFontSize(7);
      doc.text(`Page ${pageNum}/${totalPages}`, PAGE_W - MARGIN - 14, 11);
    };

    const TOP_START_Y = MARGIN + HEADER_H + 3;
    const rowsPerPage = Math.floor(
      (PAGE_H - TOP_START_Y - MARGIN) / (TILE_H + GAP),
    );
    const tilesPerPage = rowsPerPage * COLS;
    const totalPages = Math.max(
      1,
      Math.ceil(filteredUsers.length / tilesPerPage),
    );

    const drawTile = (u, x, y) => {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.roundedRect(x, y, TILE_W, TILE_H, 1.2, 1.2, "S");

      // ── NRI badge — top-right corner ──────────────────────────────────
      if (u.nri === "Yes") {
        const badgeW = 9;
        const badgeH = 3.6;
        const badgeX = x + TILE_W - badgeW - 1.2;
        const badgeY = y + 1.2;

        doc.setFillColor(22, 163, 74); // green-600
        doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1, 1, "F");

        doc.setFontSize(5.2);
        doc.setFont(undefined, "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("NRI", badgeX + badgeW / 2, badgeY + badgeH / 2 + 1, {
          align: "center",
        });

        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "normal");
      }

      // ── Junior badge — below NRI (or top-right if no NRI) ────────────
      if (isJunior(u.dob)) {
        const badgeW = 11;
        const badgeH = 3.6;
        const badgeX = x + TILE_W - badgeW - 1.2;
        // Stack below NRI badge if both present, otherwise sit at top-right
        const badgeY = u.nri === "Yes" ? y + 1.2 + 3.6 + 1 : y + 1.2;

        doc.setFillColor(99, 102, 241); // indigo-500
        doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1, 1, "F");

        doc.setFontSize(5.2);
        doc.setFont(undefined, "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("JUNIOR", badgeX + badgeW / 2, badgeY + badgeH / 2 + 1, {
          align: "center",
        });

        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "normal");
      }

      const contentY = y + TILE_PADDING;

      if (hasPhoto) {
        const b64 = photoMap[u._id];
        const photoX = x + TILE_PADDING;
        const photoY =
          contentY + (Math.max(PHOTO_SIZE, textBlockH) - PHOTO_SIZE) / 2;
        if (b64) {
          try {
            doc.addImage(b64, "JPEG", photoX, photoY, PHOTO_SIZE, PHOTO_SIZE);
          } catch (e) {
            // ignore broken image
          }
        } else {
          doc.setDrawColor(230, 230, 230);
          doc.setFillColor(245, 245, 245);
          doc.roundedRect(photoX, photoY, PHOTO_SIZE, PHOTO_SIZE, 1, 1, "FD");
          doc.setFontSize(5);
          doc.setTextColor(180, 180, 180);
          doc.text(
            "No Photo",
            photoX + PHOTO_SIZE / 2,
            photoY + PHOTO_SIZE / 2 + 1,
            { align: "center" },
          );
        }
      }

      const detailsX = x + TILE_PADDING + DETAILS_X_OFFSET;
      let cursorY =
        contentY + (Math.max(PHOTO_SIZE, textBlockH) - textBlockH) / 2;

      textFields.forEach((key) => {
        const value = fieldValue(u, key);
        const isName = key === "name";
        const isDesignation = key === "designation";

        doc.setFontSize(isName ? 8 : 6.3);
        doc.setFont(undefined, isName || isDesignation ? "bold" : "normal");

        if (isDesignation) {
          doc.setTextColor(180, 83, 9);
        } else {
          doc.setTextColor(20, 20, 20);
        }

        const fullLine = `${value}`;
        const truncated =
          doc.splitTextToSize(fullLine, DETAILS_W)[0] || fullLine;

        doc.text(truncated, detailsX, cursorY + 2.2, {
          align: "left",
          maxWidth: DETAILS_W,
        });
        cursorY += LINE_H;
      });

      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);
    };

    let pageNum = 1;
    drawPageHeader(pageNum, totalPages);

    filteredUsers.forEach((u, idx) => {
      const posOnPage = idx % tilesPerPage;

      if (idx > 0 && posOnPage === 0) {
        doc.addPage();
        pageNum += 1;
        drawPageHeader(pageNum, totalPages);
      }

      const row = Math.floor(posOnPage / COLS);
      const col = posOnPage % COLS;

      const x = MARGIN + col * (TILE_W + GAP);
      const y = TOP_START_Y + row * (TILE_H + GAP);

      drawTile(u, x, y);
    });

    doc.save("kingstar-members.pdf");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 text-white px-5 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-bold">Export Members as PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Status Filter */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Filter Members
            </p>
            <div className="flex gap-2 flex-wrap">
              {["all", "approved", "rejected", "nri", "junior"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`flex-1 py-1.5 rounded-lg text-sm border transition ${
                    filterStatus === s
                      ? s === "nri"
                        ? "bg-green-700 text-white border-green-700"
                        : s === "junior"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {s === "nri"
                    ? "NRI"
                    : s === "junior"
                      ? "Junior"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Field Selection */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Select &amp; Order Fields
            </p>
            <div className="border rounded-xl overflow-hidden divide-y divide-gray-100">
              {ALL_FIELDS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(key)}
                    onChange={() => toggle(key)}
                    className="w-4 h-4 accent-gray-900"
                  />
                  <span className="text-sm text-gray-800">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Selected Order */}
          {selected.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Field Order in Tile (drag to reorder)
              </p>
              <div className="space-y-1">
                {selected.map((key, idx) => {
                  const label =
                    ALL_FIELDS.find((f) => f.key === key)?.label || key;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm font-medium text-indigo-800">
                        <span className="text-indigo-400 mr-2">{idx + 1}.</span>
                        {label}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveUp(idx)}
                          className="p-1 text-indigo-500 hover:text-indigo-800 disabled:opacity-30"
                          disabled={idx === 0}
                        >
                          <FaAngleUp size={12} />
                        </button>
                        <button
                          onClick={() => moveDown(idx)}
                          className="p-1 text-indigo-500 hover:text-indigo-800 disabled:opacity-30"
                          disabled={idx === selected.length - 1}
                        >
                          <FaAngleDown size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Tiles render 3 per row — Photo (if selected) sits on the left of
                each tile with the fields above stacked on the right, in order.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={exportPdf}
            className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
          >
            📄 Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminUserList() {
  const STATIC_VALID_UPTO = "31/03/2027";
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  const { VITE_BACKEND_URL } = import.meta.env;

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Admin token not found");
      const res = await axios.get(`${VITE_BACKEND_URL}/api/admin/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = res.data.users || [];
      setApprovedUsers(users.filter((u) => u.membershipStatus === "approved"));
      setRejectedUsers(users.filter((u) => u.membershipStatus === "rejected"));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) navigate("/admin-login");
    else fetchUsers();
  }, [token]);

  const approveUser = async (id) => {
    if (!window.confirm("Approve this user?")) return;
    await axios.put(
      `${VITE_BACKEND_URL}/api/admin/approve/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchUsers();
  };

  const rejectUser = async (id) => {
    if (!window.confirm("Reject this user?")) return;
    await axios.put(
      `${VITE_BACKEND_URL}/api/admin/reject/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    await axios.delete(`${VITE_BACKEND_URL}/api/admin/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  const COUNTRY_CODES = [
    { code: "+91", label: "🇮🇳 +91" },
    { code: "+1", label: "🇺🇸 +1" },
    { code: "+44", label: "🇬🇧 +44" },
    { code: "+971", label: "🇦🇪 +971" },
    { code: "+974", label: "🇶🇦 +974" },
    { code: "+973", label: "🇧🇭 +973" },
    { code: "+966", label: "🇸🇦 +966" },
    { code: "+965", label: "🇰🇼 +965" },
    { code: "+968", label: "🇴🇲 +968" },
    { code: "+60", label: "🇲🇾 +60" },
    { code: "+65", label: "🇸🇬 +65" },
    { code: "+61", label: "🇦🇺 +61" },
  ];

  function splitPhone(full = "") {
    const cleaned = full.trim();
    const sorted = [...COUNTRY_CODES].sort(
      (a, b) => b.code.length - a.code.length,
    );

    for (const { code } of sorted) {
      if (cleaned.startsWith(code)) {
        let number = cleaned.slice(code.length).replace(/\D/g, "");
        const codeDigits = code.replace("+", "");
        if (number.startsWith(codeDigits)) {
          number = number.slice(codeDigits.length);
        }
        return { code, number };
      }
    }

    const stripped = cleaned.replace(/^\+\d{1,4}/, "").replace(/\D/g, "");
    return { code: "+91", number: stripped };
  }

  const openEditModal = (user) => {
    const ph = splitPhone(user.phone || "");
    const wa = splitPhone(user.whatsapp || "");
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      designation: user.designation || "",
      nickname: user.nickname || "",
      phoneCode: ph.code,
      phone: ph.number,
      password: user.password || "",
      waCode: wa.code,
      whatsapp: wa.number,
      email: user.email || "",
      address: user.address || "",
      dob: user.dob ? user.dob.split("T")[0] : "",
      bloodGroup: user.bloodGroup || "",
      place: user.place || "",
      paymentAmount: user.paymentAmount || 0,
      gender: user.gender || "",
      nri: user.nri || "No",
      expiryDate: user.expiryDate
        ? new Date(user.expiryDate).toISOString().split("T")[0]
        : "2027-03-31",
    });
  };

  const handleSaveChanges = async () => {
    try {
      setActionLoading(true);
      const payload = {
        ...editForm,
        phone: editForm.phoneCode + editForm.phone.replace(/[^\d]/g, ""),
        whatsapp: editForm.waCode + editForm.whatsapp.replace(/[^\d]/g, ""),
      };
      delete payload.phoneCode;
      delete payload.waCode;

      await axios.put(
        `${VITE_BACKEND_URL}/api/admin/user/${editingUser._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const getWhatsAppLink = (user) => {
    let phone = String(user.whatsapp || user.phone || "").replace(/[^\d]/g, "");
    if (phone.length === 10) phone = `91${phone}`;
    phone = phone.replace(/^0+/, "");

    let message = "";
    if (user.membershipStatus === "approved") {
      message = `Hello *${user.name}*, Welcome to Kingstar Arts & Sports Club.
🎉 Your membership has been approved!

🆔 Membership ID: *${user.membershipId}*
🔐 Password: *${user.password || "—"}*
✳️ Registered Mob No.: ${user.phone}

Membership Validity: ${user.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : STATIC_VALID_UPTO}

📥 Download your Membership 👇
https://kingstareriyapady.club/login

Member Details:
• Full Name: ${user.name}
• Display / Nick Name: ${user.nickname || "—"}
• Father's Name: ${user.fatherName || "—"}
• Place: ${user.address || "—"}
• Blood Group: ${user.bloodGroup || "—"}

Thank you for becoming a member of Kingstar Arts & Sports Club.

Sabit Aboobacker (Gen. Sec)
📞 91 9747656653`;
    } else if (user.membershipStatus === "rejected") {
      message = `Hello ${user.name}, 
Your membership request with Kingstar Eriyapady has been *rejected* due to _______.

For further clarification, please contact the Secretary at:
📞 91 9747656653 (Sabit)

_Thank you for your interest in Kingstar Arts & Sports Club._

---------------------------------
_Kingstareriyapady.club_ | https://www.instagram.com/kingstar.club/
_________________

For further clarification, please contact:
📞 91 9747656653 (Sabit Aboobacker – Gen. Sec)

_Thank you for your interest in Kingstar Arts & Sports Club._

------------------------------
Kingstar Arts & Sports Club`;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  const allUsers = [...approvedUsers, ...rejectedUsers];
  const statusFiltered =
    filter === "all"
      ? allUsers
      : filter === "approved"
        ? approvedUsers
        : rejectedUsers;
  const q = search.trim().toLowerCase();
  const filteredUsers = q
    ? statusFiltered.filter((u) => {
        if (q === "nri") return u.nri === "Yes";
        if (q === "junior") return isJunior(u.dob);
        return (
          (u.name || "").toLowerCase().includes(q) ||
          String(u.membershipId || "")
            .toLowerCase()
            .includes(q)
        );
      })
    : statusFiltered;

  return (
    <>
      <main className="flex-1 p-3 sm:p-4 md:p-6 pb-20">
        {/* Title row with Export button */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div className="flex-1" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center flex-1">
            User List
          </h1>
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition shadow"
            >
              📄 <span className="hidden sm:inline">Export as PDF</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4 relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search by name, membership ID, or type "nri" / "junior"…'
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 text-lg"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
          {["all", "approved", "rejected"].map((f) => {
            const count =
              f === "all"
                ? allUsers.length
                : f === "approved"
                  ? approvedUsers.length
                  : rejectedUsers.length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base ${
                  filter === f ? "bg-gray-800 text-white" : "bg-white border"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {/* Result count hint when searching */}
        {q && (
          <p className="text-xs text-gray-500 text-center mb-3">
            {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}{" "}
            for &quot;{search}&quot;
          </p>
        )}

        {/* Users Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              STATIC_VALID_UPTO={STATIC_VALID_UPTO}
              approveUser={approveUser}
              rejectUser={rejectUser}
              deleteUser={deleteUser}
              openEditModal={openEditModal}
              getWhatsAppLink={getWhatsAppLink}
            />
          ))}
        </div>
      </main>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-md shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-base font-medium text-gray-900 flex items-center gap-2">
                Edit user
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Membership section */}
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-2.5">
                  Membership
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      NRI status
                    </label>
                    <div className="flex gap-2">
                      {["No", "Yes"].map((v) => (
                        <button
                          key={v}
                          onClick={() => setEditForm({ ...editForm, nri: v })}
                          className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                            editForm.nri === v
                              ? "border-gray-400 bg-gray-50 font-medium text-gray-800"
                              : "border-gray-200 text-gray-500"
                          }`}
                        >
                          {v === "No" ? "Not NRI" : "NRI"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Membership expiry date
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                        value={editForm.expiryDate}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            expiryDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Designation
                      </label>
                      <select
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 bg-white"
                        value={editForm.designation}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            designation: e.target.value,
                          })
                        }
                      >
                        <option value="">— Select —</option>
                        <option value="member">Member</option>
                        <option value="President">President</option>
                        <option value="Gen. Secretary">Gen. Secretary</option>
                        <option value="Treasurer">Treasurer</option>
                        <option value="Vice President">Vice President</option>
                        <option value="Joint Secretary">Joint Secretary</option>
                        <option value="Captain">Captain</option>
                        <option value="Exec. Member">Exec. Member</option>
                        <option value="Chairman">Chairman</option>
                        <option value="Vice Chairman">Vice Chairman</option>
                        <option value="Convenor">Convenor</option>
                        <option value="Joint convenor">Joint convenor</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal details */}
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-2.5">
                  Personal details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Full name
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                      placeholder="e.g. Arun Kumar"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Nickname
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                      placeholder="e.g. Aru"
                      value={editForm.nickname}
                      onChange={(e) =>
                        setEditForm({ ...editForm, nickname: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Date of birth
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                      value={editForm.dob}
                      onChange={(e) =>
                        setEditForm({ ...editForm, dob: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Blood group
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                      placeholder="e.g. O+"
                      value={editForm.bloodGroup}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bloodGroup: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-2.5">
                  Contact
                </p>
                <div className="space-y-3">
                  <div className="gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Phone
                      </label>
                      <div className="flex gap-1.5">
                        <select
                          className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-gray-400 bg-white"
                          style={{ width: "92px" }}
                          value={editForm.phoneCode}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              phoneCode: e.target.value,
                            })
                          }
                        >
                          {COUNTRY_CODES.map(({ code, label }) => (
                            <option key={code} value={code}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <input
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                          placeholder="9876543210"
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        WhatsApp
                      </label>
                      <div className="flex gap-1.5">
                        <select
                          className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-gray-400 bg-white"
                          style={{ width: "92px" }}
                          value={editForm.waCode}
                          onChange={(e) =>
                            setEditForm({ ...editForm, waCode: e.target.value })
                          }
                        >
                          {COUNTRY_CODES.map(({ code, label }) => (
                            <option key={code} value={code}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <input
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                          placeholder="9876543210"
                          value={editForm.whatsapp}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              whatsapp: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                      placeholder="email@example.com"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Address
                      </label>
                      <textarea
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-gray-400"
                        rows={3}
                        placeholder="Street, area…"
                        value={editForm.address}
                        onChange={(e) =>
                          setEditForm({ ...editForm, address: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Place
                        </label>
                        <input
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                          placeholder="City / town"
                          value={editForm.place}
                          onChange={(e) =>
                            setEditForm({ ...editForm, place: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Payment Amount
                        </label>
                        <input
                          type="number"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                          placeholder="Amount in INR"
                          value={editForm.paymentAmount}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              paymentAmount: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider + Password */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Password
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  placeholder="Enter password"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 pb-5">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleSaveChanges}
                className="px-5 py-2 text-sm bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 disabled:opacity-50"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT PDF MODAL */}
      {showExportModal && (
        <ExportPdfModal
          users={allUsers}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </>
  );
}

// ─── UserCard ────────────────────────────────────────────────────────────────
function UserCard({
  user,
  approveUser,
  rejectUser,
  deleteUser,
  openEditModal,
  getWhatsAppLink,
}) {
  const [expanded, setExpanded] = useState(false);

  const getEffectiveDays = () => {
    const staticExpiry = new Date("2027-03-31");
    staticExpiry.setHours(0, 0, 0, 0);

    const memberExpiry = user.expiryDate
      ? new Date(user.expiryDate)
      : staticExpiry;
    memberExpiry.setHours(0, 0, 0, 0);

    const expiry = memberExpiry < staticExpiry ? memberExpiry : staticExpiry;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const days = getEffectiveDays();
  const isExpired = days <= 0;
  const isExpiringSoon = days <= 30 && !isExpired;
  const junior = isJunior(user.dob);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 w-full flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={user.photo || "/default-user.png"}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover border"
          />
          <div className="flex flex-col">
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-xs text-gray-600">ID: {user.membershipId}</p>

            {/* ── Badges row ─────────────────────────────────────────── */}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {user.nri === "Yes" && (
                <span className="text-[10px] font-bold text-white bg-green-600 px-1.5 py-0.5 rounded">
                  NRI
                </span>
              )}
              {junior && (
                <span className="text-[10px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded">
                  JUNIOR
                </span>
              )}
            </div>

            {user.photo && (
              <a
                href={user.photo}
                download={`${user.name}-photo`}
                className="mt-1 text-xs text-blue-600 hover:underline"
              >
                Download Photo
              </a>
            )}
          </div>
        </div>

        {/* Days badge + expand button */}
        <div className="flex items-center gap-4 ml-auto">
          <div
            className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 min-w-[52px] border ${
              isExpired
                ? "bg-red-50 border-red-200"
                : isExpiringSoon
                  ? "bg-amber-50 border-amber-200"
                  : "bg-indigo-50 border-indigo-200"
            }`}
          >
            <span
              className={`text-[10px] font-extrabold leading-none ${
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
              className={`text-[7px] font-semibold text-center uppercase tracking-wide mt-0.5 ${
                isExpired
                  ? "text-red-400"
                  : isExpiringSoon
                    ? "text-amber-400"
                    : "text-indigo-400"
              }`}
            >
              {isExpired ? "Expired" : "days left"}
            </span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1 text-xs bg-indigo-500 text-white rounded"
          >
            {expanded ? <FaAngleUp /> : <FaAngleDown />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 text-sm space-y-2">
          <p>
            <b>Designation:</b> {user.designation}
          </p>
          <p>
            <b>Phone:</b> {user.phone}
          </p>
          <p>
            <b>Email:</b> {user.email || "—"}
          </p>
          <p>
            <b>Father:</b> {user.fatherName || "—"}
          </p>
          <p>
            <b>Nickname:</b> {user.nickname || "—"}
          </p>
          <p>
            <b>Whatsapp:</b> {user.whatsapp || "—"}
          </p>
          <p>
            <b>Payment Amount:</b> ₹{user.paymentAmount || "—"}
          </p>
          <p>
            <b>DOB:</b>{" "}
            {user.dob ? new Date(user.dob).toLocaleDateString() : "—"}
          </p>
          <p>
            <b>Blood Group:</b> {user.bloodGroup || "—"}
          </p>
          <p>
            <b>Address:</b> {user.address || "—"}
          </p>
          <p>
            <b>Place:</b> {user.place || "—"}
          </p>
          <p>
            <b>NRI:</b> {user.nri === "Yes" ? "Yes ✅" : "No"}
          </p>
          <p>
            <b>Junior:</b> {junior ? "Yes 🟣" : "No"}
          </p>
          <p>
            <b>Expiry Date:</b>{" "}
            {new Date(user.expiryDate || "2027-03-31").toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "long",
                year: "numeric",
              },
            )}
          </p>
          <div className="flex gap-2 flex-wrap pt-2">
            {user.membershipStatus === "approved" ? (
              <button
                onClick={() => rejectUser(user._id)}
                className="px-2 py-1 text-xs bg-orange-600 text-white rounded"
              >
                Reject
              </button>
            ) : (
              <button
                onClick={() =>
                  user.membershipStatus === "approved"
                    ? rejectUser(user._id)
                    : approveUser(user._id)
                }
                className={`px-2 py-1 text-xs text-white rounded ${user.membershipStatus === "approved" ? "bg-orange-600" : "bg-green-600"}`}
              >
                {user.membershipStatus === "approved" ? "Reject" : "Re-Approve"}
              </button>
            )}
            <button
              onClick={() => openEditModal(user)}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
            >
              Edit
            </button>
            <button
              onClick={() => deleteUser(user._id)}
              className="px-2 py-1 text-xs bg-red-800 text-white rounded"
            >
              Delete
            </button>
            <a
              href={getWhatsAppLink(user)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 text-xs bg-gray-800 text-white rounded"
            >
              Share
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
