import { useState } from "react";
import MemberRegister from "../components/MemberRegister";
import JuniorRegister from "./JuniorRegister";

export default function Register() {
  const [mode, setMode] = useState("member"); // "member" | "junior"

  return (
    <div className="min-h-screen">
      {/* ── Toggle bar ── */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 py-3">
        <div className="max-w-md mx-auto px-4">
          <div className="flex bg-gray-100 rounded-full p-1">
            <button
              type="button"
              onClick={() => setMode("member")}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                mode === "member"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Member Registration
            </button>
            <button
              type="button"
              onClick={() => setMode("junior")}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                mode === "junior"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Junior Registration
            </button>
          </div>
        </div>
      </div>

      {/* ── Selected form ── */}
      {mode === "member" ? <MemberRegister /> : <JuniorRegister />}
    </div>
  );
}
