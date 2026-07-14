import { isJunior, isCommitteeMember, formatAadhaar } from "./helpers";

// ─── Filters shape ──────────────────────────────────────────────────────────
// {
//   status:   "all" | "approved" | "rejected"
//   category: "all" | "committee" | "member"
//   nri:      "all" | "yes" | "no"
//   juniorOnly: boolean
// }

export const applyFilters = (users, filters) => {
  return users
    .filter((u) => {
      if (filters.status !== "all" && u.membershipStatus !== filters.status)
        return false;

      if (filters.category === "committee" && !isCommitteeMember(u.designation))
        return false;
      if (filters.category === "member" && isCommitteeMember(u.designation))
        return false;

      if (filters.nri === "yes" && u.nri !== "Yes") return false;
      if (filters.nri === "no" && u.nri === "Yes") return false;

      if (filters.juniorOnly && !isJunior(u.dob)) return false;

      return true;
    })
    .sort((a, b) =>
      String(a.membershipId || "").localeCompare(
        String(b.membershipId || ""),
        undefined,
        { numeric: true },
      ),
    );
};

// Human readable summary of the active filter combination, used in the PDF
// header and as part of the exported filename.
export const describeFilters = (filters) => {
  const parts = [];

  if (filters.category === "committee") parts.push("Committee");
  else if (filters.category === "member") parts.push("Regular Members");
  else parts.push("All Members");

  if (filters.nri === "yes") parts.push("International");
  else if (filters.nri === "no") parts.push("General");

  if (filters.juniorOnly) parts.push("Juniors");

  if (filters.status !== "all") {
    parts.push(filters.status.charAt(0).toUpperCase() + filters.status.slice(1));
  }

  return parts.join(" · ");
};

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

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

const fieldValue = (u, key) => {
  let val = u[key] ?? "—";
  if (key === "dob" && val && val !== "—") {
    val = new Date(val).toLocaleDateString();
  }
  if (key === "aadhaar") {
    val = `Aadhaar: ${formatAadhaar(val)}`;
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

// ─── Main entry point ───────────────────────────────────────────────────────
export const generateMembersPdf = async ({ users, selected, filters }) => {
  if (selected.length === 0) {
    alert("Please select at least one field.");
    return;
  }

  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  );

  const { jsPDF } = window.jspdf;

  const filteredUsers = applyFilters(users, filters);
  const filterLabel = describeFilters(filters);

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

  const drawPageHeader = (pageNum, totalPages) => {
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("Kingstar Arts & Sports Club – Member List", MARGIN, 11);
    doc.setFontSize(7.5);
    doc.setFont(undefined, "normal");
    doc.text(
      `Filter: ${filterLabel}   |   Total: ${filteredUsers.length}   |   Generated: ${new Date().toLocaleDateString()}`,
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

    // ── Committee badge — below NRI (or top-right if no NRI) ──────────
    if (isCommitteeMember(u.designation)) {
      const badgeW = 15;
      const badgeH = 3.6;
      const badgeX = x + TILE_W - badgeW - 1.2;
      const badgeY = u.nri === "Yes" ? y + 1.2 + 3.6 + 1 : y + 1.2;

      doc.setFillColor(180, 83, 9); // amber-700
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1, 1, "F");

      doc.setFontSize(5.2);
      doc.setFont(undefined, "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("COMMITTEE", badgeX + badgeW / 2, badgeY + badgeH / 2 + 1, {
        align: "center",
      });

      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "normal");
    }

    // ── Junior badge — stacks below whichever badges are present ─────
    if (isJunior(u.dob)) {
      const badgeW = 11;
      const badgeH = 3.6;
      const badgeX = x + TILE_W - badgeW - 1.2;
      const stackedCount =
        (u.nri === "Yes" ? 1 : 0) + (isCommitteeMember(u.designation) ? 1 : 0);
      const badgeY = y + 1.2 + stackedCount * (3.6 + 1);

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

  const slug = filterLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  doc.save(`kingstar-members-${slug || "all"}.pdf`);
};
