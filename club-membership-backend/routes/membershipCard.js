import express from "express";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import User from "../models/User.js";

const router = express.Router();

router.get("/membership-card/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || user.membershipStatus !== "approved") {
      return res.status(404).json({ message: "Membership not approved" });
    }

    const doc = new PDFDocument({
      size: [1120, 620], // same as card size
      margin: 0,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=MembershipCard_${user.membershipId}.pdf`
    );

    doc.pipe(res);

    /* =======================
       ASSET PATHS
    ======================= */
    const bgPath = path.resolve("assets/card-bg.webp");
    const logoPath = path.resolve("assets/club-logo.webp");
    const stampPath = path.resolve("assets/stamp.webp");
    const signPath = path.resolve("assets/signature.webp");
    const photoPath = user.photo
      ? path.resolve(user.photo)
      : path.resolve("assets/default-user.webp");

    /* =======================
       BACKGROUND
    ======================= */
    doc.image(bgPath, 0, 0, { width: 1120, height: 620 });

    /* =======================
       LOGO
    ======================= */
    doc.image(logoPath, 40, 40, { width: 90 });

    /* =======================
       HEADER TEXT
    ======================= */
    doc
      .fillColor("#facc15")
      .fontSize(38)
      .font("Helvetica-Bold")
      .text("KINGSTAR ERIYAPADY", 160, 40);

    doc
      .fillColor("white")
      .fontSize(18)
      .text("KINGSTAR ARTS & SPORTS CLUB ERIYAPADY", 160, 85);

    doc
      .fontSize(12)
      .text(
        "Reg.No 324/98 | Affiliated to NYK-114/99 | KSYWB-KZD/B2/0005/13",
        160,
        110
      );

    doc
      .fillColor("#facc15")
      .fontSize(20)
      .text("#BecomeProudMember", 160, 145);

    /* =======================
       PROFILE PHOTO
    ======================= */
    doc.circle(190, 330, 110).clip();
    doc.image(photoPath, 80, 220, { width: 220, height: 220 });
    doc.restore();

    /* =======================
       NAME + ID
    ======================= */
    doc
      .fillColor("#ca8a04")
      .fontSize(42)
      .font("Helvetica-Bold")
      .text(user.name.toUpperCase(), 350, 250);

    doc
      .fillColor("#1f2937")
      .fontSize(24)
      .text(user.membershipId, 350, 300);

    /* =======================
       DETAILS
    ======================= */
    const expiry = new Date(user.createdAt);
    expiry.setFullYear(expiry.getFullYear() + 1);

    doc
      .fontSize(18)
      .fillColor("black")
      .text(`FULL NAME : ${user.name}`, 80, 450)
      .text(`MEMBERSHIP ID : ${user.membershipId}`, 80, 480)
      .text(`MOBILE NO : ${user.phone}`, 80, 510)
      .text(`BLOOD GROUP : ${user.bloodGroup || "N/A"}`, 80, 540)
      .text(`VALID UPTO : ${expiry.toLocaleDateString("en-GB")}`, 80, 570);

    /* =======================
       STAMP
    ======================= */
    doc.image(stampPath, 750, 400, {
      width: 200,
      rotate: -12,
    });

    /* =======================
       SIGNATURE
    ======================= */
    doc.image(signPath, 780, 520, { width: 180 });

    doc
      .fontSize(12)
      .fillColor("#374151")
      .text("Authorised Signatory", 800, 570)
      .text("Gen. Secretary", 820, 585);

    doc.end();
  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
