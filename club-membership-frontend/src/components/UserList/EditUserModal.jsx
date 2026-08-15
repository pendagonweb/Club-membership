import { useState } from "react";
import { COUNTRY_CODES } from "./helpers";

export default function EditUserModal({
  editForm,
  setEditForm,
  onClose,
  onSave,
  actionLoading,
}) {
  const [newDonationDate, setNewDonationDate] = useState("");
  const addDonationDate = () => {
    if (!newDonationDate) return;
    const existing = editForm.bloodDonations || [];
    const already = existing.some(
      (d) => new Date(d).toISOString().slice(0, 10) === newDonationDate,
    );
    if (already) return;
    setEditForm({
      ...editForm,
      bloodDonations: [...existing, newDonationDate].sort(
        (a, b) => new Date(b) - new Date(a),
      ),
    });
    setNewDonationDate("");
  };

  const removeDonationDate = (idx) => {
    setEditForm({
      ...editForm,
      bloodDonations: editForm.bloodDonations.filter((_, i) => i !== idx),
    });
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-md shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-medium text-gray-900 flex items-center gap-2">
            Edit user
          </h2>
          <button
            onClick={onClose}
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
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Aadhaar number
              </label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="1234 5678 9012"
                maxLength={12}
                value={editForm.aadhaar}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    aadhaar: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
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
          {/* Blood Donation History */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-2.5">
              Blood Donation History
            </p>
            <div className="flex gap-2 mb-3">
              <input
                type="date"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                value={newDonationDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setNewDonationDate(e.target.value)}
              />
              <button
                type="button"
                onClick={addDonationDate}
                disabled={!newDonationDate}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40"
              >
                + Add
              </button>
            </div>

            {editForm.bloodDonations?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {editForm.bloodDonations.map((date, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    🩸{" "}
                    {new Date(date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    <button
                      type="button"
                      onClick={() => removeDonationDate(idx)}
                      className="text-red-400 hover:text-red-700 ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No donation records yet.</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Total donations: {editForm.bloodDonations?.length || 0}
            </p>
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
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={actionLoading}
            onClick={onSave}
            className="px-5 py-2 text-sm bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 disabled:opacity-50"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
