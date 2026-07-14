import { useState } from "react";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";
import { isJunior, isCommitteeMember } from "./helpers";

export default function UserCard({
  user,
  STATIC_VALID_UPTO,
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
  const committee = isCommitteeMember(user.designation);

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
              {committee && (
                <span className="text-[10px] font-bold text-white bg-amber-700 px-1.5 py-0.5 rounded">
                  COMMITTEE
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
            <b>Aadhaar:</b> {user.aadhaar || "—"}
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
            <b>Committee:</b> {committee ? "Yes 🟠" : "No"}
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
