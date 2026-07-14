import { useState, useMemo } from "react";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";
import { ALL_FIELDS, DEFAULT_SELECTED_FIELDS } from "./fields";
import { generateMembersPdf, applyFilters } from "./exportPdfGenerator";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Members" },
  { value: "committee", label: "Committee" },
  { value: "member", label: "Regular Members" },
];

const NRI_OPTIONS = [
  { value: "all", label: "Both" },
  { value: "yes", label: "International" },
  { value: "no", label: "General" },
];

function PillGroup({ title, options, value, onChange, activeClass }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1.5">{title}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-sm border transition whitespace-nowrap ${
              value === opt.value
                ? activeClass || "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ExportPdfModal({ users, onClose }) {
  const [selected, setSelected] = useState(DEFAULT_SELECTED_FIELDS);

  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [nri, setNri] = useState("all");
  const [juniorOnly, setJuniorOnly] = useState(false);

  const filters = { status, category, nri, juniorOnly };

  const previewCount = useMemo(
    () => applyFilters(users, filters).length,
    [users, status, category, nri, juniorOnly],
  );

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

  const handleExport = () => {
    generateMembersPdf({ users, selected, filters });
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
          {/* Filters */}
          <div className="space-y-4">
            <PillGroup
              title="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
            />

            <PillGroup
              title="Category"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={setCategory}
              activeClass="bg-amber-700 text-white border-amber-700"
            />

            <PillGroup
              title="NRI"
              options={NRI_OPTIONS}
              value={nri}
              onChange={setNri}
              activeClass="bg-green-700 text-white border-green-700"
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={juniorOnly}
                onChange={(e) => setJuniorOnly(e.target.checked)}
                className="w-4 h-4 accent-indigo-600"
              />
              <span className="text-sm text-gray-800">Juniors only</span>
            </label>

            <p className="text-xs text-gray-400">
              {previewCount} member{previewCount !== 1 ? "s" : ""} match the
              current filters.
            </p>
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
            onClick={handleExport}
            className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
          >
            📄 Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
