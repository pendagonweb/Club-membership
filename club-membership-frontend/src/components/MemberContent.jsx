import React from "react";

// Assets
import BgMain from "../assets/hashtag.webp";
import Hashtag from "../assets/hashtag2.webp";
import Logo from "../assets/logoFile.webp";
import name from "../assets/name.webp";
import LinesFlip from "../assets/lines-flip.webp";
import Lines2 from "../assets/lines2.webp";
import Stamp from "../assets/stamp.webp";
import Signature from "../assets/Signatur.webp";

export default function MembershipCard({ user }) {
  if (!user) return null;

  const STATIC_VALID_UPTO = "31/03/2027";

  const valiedUpto = user.expiryDate
    ? new Date(user.expiryDate).toLocaleDateString()
    : STATIC_VALID_UPTO;

  const isJunior = Number(user.age) < 20;

  const cardBg = isJunior ? "#fff4e8" : "#f4f1f1";

  const headerBackground = isJunior
    ? "linear-gradient(45deg, #16dea0 0%, #8d46ee 100%)"
    : "linear-gradient(45deg, #203a8f 0%, #1e40af 100%)";

  const textColorClass = isJunior ? "text-[#9a3412]" : "text-color";

  return (
    <div
      className="w-[300px] h-[200px] relative overflow-hidden rounded-xl shadow-xl"
      style={{ backgroundColor: cardBg }}
    >
      {/* Top Header */}
      <div
        className="w-[270px] h-[60px] relative overflow-hidden rounded-xl m-4"
        style={{
          background: headerBackground,
        }}
      >
        <img
          src={Lines2}
          alt="Card Background"
          className="absolute w-[800px] -bottom-5 left-0"
        />
      </div>

      {/* Header Waves */}
      <img
        src={LinesFlip}
        alt="lines"
        className="absolute -top-5 left-0 w-full h-55 opacity-40"
      />

      {/* Club Logo */}
      <img src={Logo} alt="logo" className="absolute top-6 left-6 w-7" />

      {/* Header Text */}
      <div className="absolute -right-17 -top-8 w-[320px]">
        <img src={name} alt="logo" />
      </div>

      {/* Hashtag */}
      <img
        src={Hashtag}
        alt="hashtag"
        className="absolute top-[60px] left-[120px] w-30"
      />

      {/* Profile Image */}
      <div
        className="absolute top-[42px] left-10 w-19 h-19 rounded-full overflow-hidden bg-white"
        style={{
          border: `4px solid ${isJunior ? "#16dea0" : "#203a8f"}`,
        }}
      >
        <img
          src={user.photo}
          alt="profile"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name & ID */}
      <div className="absolute NID uppercase">
        <p className={`font-bold leading-5 text-[15px] ${textColorClass}`}>
          {user.nickname}
        </p>
        <p className={`text-[10px] ${textColorClass}`}>{user.membershipId}</p>
      </div>

      {/* Member Details */}
      <div className="absolute bottom-5 left-7 text-[6px]">
        <div className="grid grid-cols-[50px_10px_auto]">
          <p>FULL NAME</p>
          <p>:</p>
          <p className="font-semibold">{user.name}</p>

          <p>MEMBERSHIP ID</p>
          <p>:</p>
          <p className="font-semibold">{user.membershipId}</p>

          <p>MOBILE NO</p>
          <p>:</p>
          <p className="font-semibold">
            {"X".repeat(user.phone.length - 4) + user.phone.slice(-4)}
          </p>

          <p>BLOOD GROUP</p>
          <p>:</p>
          <p className="font-semibold">{user.bloodGroup || "NIL"}</p>

          <p>VALID UPTO</p>
          <p>:</p>
          <p className="font-semibold">{valiedUpto}</p>
        </div>
      </div>

      {/* Stamp */}
      <img
        src={Stamp}
        alt="stamp"
        className="absolute bottom-3 right-16 -rotate-16 w-15 opacity-90"
      />

      {/* Signature */}
      <div className="absolute bottom-[14px] right-[17px] flex flex-col items-center text-center">
        <img src={Signature} alt="Signature" className="w-[30px] pb-1" />

        <p className="border-b border-b-zinc-500 w-[40px]"></p>

        <p className="font-medium text-[3px] text-gray-600 pt-1">
          Authorised Signatory
        </p>
        <p className="font-medium text-[3px] text-gray-600">(Gen. Secretary)</p>
      </div>
    </div>
  );
}
