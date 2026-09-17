import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const PERMISSION_LABELS = {
  requests: "Membership Requests",
  members: "Members (edit/delete)",
  juniors: "Junior Members",
  panels: "Election Panels",
  gallery: "Gallery / Posters / News",
  activities: "Activities & Events",
  logo: "Site Logo",
};

const emptyForm = {
  username: "",
  password: "",
  name: "",
  role: "admin",
  permissions: [],
};

function RoleBadge({ role }) {
  return role === "superadmin" ? (
    <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
      Superadmin
    </span>
  ) : (
    <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
      Admin
    </span>
  );
}

export default function AdminManagement({ adminInfo }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("adminToken");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const flash = (msg, type = "success") => {
    if (type === "success") setSuccess(msg);
    else setError(msg);
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3500);
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API}/api/admin-management`,
        authHeader,
      );
      setAdmins(data.admins || []);
    } catch (err) {
      flash(err.response?.data?.message || "Failed to load admins.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (admin) => {
    setEditing(admin);
    setForm({
      username: admin.username,
      password: "",
      name: admin.name || "",
      role: admin.role,
      permissions: admin.permissions || [],
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const togglePermission = (perm) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        const payload = {
          name: form.name,
          role: form.role,
          permissions: form.permissions,
        };
        if (form.password) payload.password = form.password;
        await axios.put(
          `${API}/api/admin-management/${editing._id}`,
          payload,
          authHeader,
        );
        flash("Admin updated.");
      } else {
        await axios.post(`${API}/api/admin-management`, form, authHeader);
        flash("Admin created.");
      }
      closeForm();
      fetchAdmins();
    } catch (err) {
      flash(err.response?.data?.message || "Something went wrong.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (admin) => {
    try {
      await axios.put(
        `${API}/api/admin-management/${admin._id}`,
        { isActive: !admin.isActive },
        authHeader,
      );
      flash(`Admin ${admin.isActive ? "deactivated" : "activated"}.`);
      fetchAdmins();
    } catch (err) {
      flash(err.response?.data?.message || "Failed to update status.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Delete this admin permanently? This cannot be undone.")
    )
      return;
    try {
      await axios.delete(`${API}/api/admin-management/${id}`, authHeader);
      flash("Admin deleted.");
      fetchAdmins();
    } catch (err) {
      flash(err.response?.data?.message || "Failed to delete admin.", "error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create admins and control what each one can access.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <span className="text-lg leading-none">+</span> New Admin
        </button>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading admins…</div>
      ) : admins.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No admins found.</div>
      ) : (
        <div className="grid gap-4">
          {admins.map((admin) => (
            <div
              key={admin._id}
              className={`bg-white border rounded-xl p-4 sm:p-5 shadow-sm ${admin.isActive ? "border-gray-200" : "border-gray-200 opacity-60"}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold text-gray-800">
                      {admin.name || admin.username}
                    </h2>
                    <RoleBadge role={admin.role} />
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${admin.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {admin.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    @{admin.username}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {admin.role === "superadmin" ? (
                      <span className="text-xs text-amber-600 font-medium">
                        Full access to everything
                      </span>
                    ) : admin.permissions?.length ? (
                      admin.permissions.map((p) => (
                        <span
                          key={p}
                          className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full"
                        >
                          {PERMISSION_LABELS[p] || p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        No permissions assigned yet
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:shrink-0">
                  <button
                    onClick={() => handleToggleActive(admin)}
                    disabled={admin._id === adminInfo?.id}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition disabled:opacity-40 ${admin.isActive ? "border-gray-300 text-gray-600 hover:bg-gray-50" : "border-green-300 text-green-600 hover:bg-green-50"}`}
                  >
                    {admin.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => openEdit(admin)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(admin._id)}
                    disabled={admin._id === adminInfo?.id}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">
                {editing ? "Edit Admin" : "Create Admin"}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  placeholder="e.g. Sabit Aboobacker"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editing
                    ? "Reset Password (leave blank to keep current)"
                    : "Password"}{" "}
                  {!editing && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  required={!editing}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="flex gap-2">
                  {["admin", "superadmin"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r })}
                      className={`flex-1 py-2 text-sm rounded-lg border transition ${form.role === r ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold" : "border-gray-200 text-gray-500"}`}
                    >
                      {r === "superadmin"
                        ? "Superadmin (full access)"
                        : "Admin (limited)"}
                    </button>
                  ))}
                </div>
              </div>

              {form.role === "admin" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(key)}
                          onChange={() => togglePermission(key)}
                          className="w-4 h-4 accent-blue-600"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    An admin can hold as many of these as needed — e.g. Gallery
                    + Activities together.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-sm px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : editing
                      ? "Save Changes"
                      : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
