import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MemberContent from "../components/MemberContent";
import html2canvas from "html2canvas";

const MembershipCard = ({ user: propUser }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = propUser || state?.user; // Use prop if provided, else fallback to location state

  const componentRef = useRef(null);

  /* ==============================
     DOWNLOAD AS IMAGE
  ============================== */
 const handleDownloadImage = async () => {
  if (!componentRef.current) return;

  try {
    const canvas = await html2canvas(componentRef.current, {
      scale: 4,
      useCORS: true,
      logging: false,
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll("*").forEach((el) => {
          const computed = clonedDoc.defaultView.getComputedStyle(el);

          ["color", "background-color", "border-color", "outline-color"].forEach((prop) => {
            const value = computed.getPropertyValue(prop);
            if (value && value.includes("oklch")) {
              // replace unsupported oklch with black or white
              el.style.setProperty(prop, "#000000", "important");
            }
          });
        });
      },
    });

    const imageData = canvas.toDataURL("image/png");
    const link = document.createElement("a");

    const fileId = user?.membershipId
      ? user.membershipId.slice(-4).toUpperCase()
      : "CARD";

    link.download = `Membership_${fileId}.png`;
    link.href = imageData;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Image download failed:", error);
    alert("Image download failed. Please try again.");
  }
};


  const handleShareCard = async () => {
  if (!componentRef.current) return;

  try {
    const canvas = await html2canvas(componentRef.current, { scale: 2, useCORS: true });
    canvas.toBlob(async (blob) => {
      if (!blob) throw new Error("Failed to generate image blob");

      const fileId = user?.membershipId ? user.membershipId.slice(-4).toUpperCase() : "CARD";
      const file = new File([blob], `Membership_${fileId}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // Mobile: share directly
        await navigator.share({
          files: [file],
          title: "Membership Card",
          text: `Hello ${user.name}, here is your Kingstar Arts & Sports Club membership card!`,
        });
      } else {
        // Desktop fallback: download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert(
          "Direct WhatsApp sharing is not supported on this device. The card has been downloaded. You can share it manually via WhatsApp Web."
        );
      }
    });
  } catch (err) {
    console.error("Sharing failed:", err);
    alert("Image generation failed. Please try again.");
  }
};





  /* ==============================
     RENDER
  ============================== */
  if (!user) {
    return (
      <div className="flex flex-col items-center text-center">
        <p className="text-red-600 mb-4">
          User data not found.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center   w-full">
      {/* Membership card capture area */}
      <div ref={componentRef} className="relative w-[300px] h-auto ">
        <MemberContent user={user} />
      </div>

      {/* Download button */}
     <div className="flex gap-4 mt-3 ">
  {/* Download Button */}
  <button
    onClick={handleDownloadImage}
    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
  >
     Download Membership
  </button>




</div>

      
    </div>

    
  );
};

export default MembershipCard;