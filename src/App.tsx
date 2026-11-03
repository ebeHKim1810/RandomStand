import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Users,
  Shuffle,
  RotateCcw,
  Undo2,
  Trash2,
  Download,
  Printer,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Palette,
  Sparkles,
  FlaskConical,
  GripVertical,
  Info,
  Check,
  Sliders,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  BookOpen,
  Layers,
  Grid,
  ArrowLeftRight,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  X
} from 'lucide-react';

// ============================================================================
// 1. COLORBLIND-CONSCIOUS PALETTE PRESETS & DEFAULT THEMES
// ============================================================================
// Carefully selected high-contrast, colorblind-conscious palettes (Okabe-Ito &
// Paul Tol inspired) so every exam code has both distinct hue/luminance and
// explicit text labeling.
const DEFAULT_CODE_PALETTE = [
  {
    codeIndex: 0,
    name: 'Sky Blue',
    bg: '#EFF6FF',
    border: '#60A5FA',
    badgeBg: '#1D4ED8',
    badgeText: '#FFFFFF',
    text: '#1E3A8A',
    subText: '#3B82F6',
    swatch: '#2563EB'
  },
  {
    codeIndex: 1,
    name: 'Amber Gold',
    bg: '#FFFBEB',
    border: '#F59E0B',
    badgeBg: '#B45309',
    badgeText: '#FFFFFF',
    text: '#78350F',
    subText: '#D97706',
    swatch: '#D97706'
  },
  {
    codeIndex: 2,
    name: 'Emerald Teal',
    bg: '#ECFDF5',
    border: '#34D399',
    badgeBg: '#047857',
    badgeText: '#FFFFFF',
    text: '#064E3B',
    subText: '#059669',
    swatch: '#059669'
  },
  {
    codeIndex: 3,
    name: 'Royal Purple',
    bg: '#F5F3FF',
    border: '#A78BFA',
    badgeBg: '#6D28D9',
    badgeText: '#FFFFFF',
    text: '#4C1D95',
    subText: '#7C3AED',
    swatch: '#7C3AED'
  },
  {
    codeIndex: 4,
    name: 'Coral Rose',
    bg: '#FFF1F2',
    border: '#FB7185',
    badgeBg: '#BE123C',
    badgeText: '#FFFFFF',
    text: '#881337',
    subText: '#E11D48',
    swatch: '#E11D48'
  },
  {
    codeIndex: 5,
    name: 'Cyan Slate',
    bg: '#ECFEFF',
    border: '#22D3EE',
    badgeBg: '#0E7490',
    badgeText: '#FFFFFF',
    text: '#164E63',
    subText: '#0891B2',
    swatch: '#0891B2'
  },
  {
    codeIndex: 6,
    name: 'Tangerine',
    bg: '#FFF7ED',
    border: '#FB923C',
    badgeBg: '#C2410C',
    badgeText: '#FFFFFF',
    text: '#7C2D12',
    subText: '#EA580C',
    swatch: '#EA580C'
  },
  {
    codeIndex: 7,
    name: 'Indigo Night',
    bg: '#EEF2FF',
    border: '#818CF8',
    badgeBg: '#4338CA',
    badgeText: '#FFFFFF',
    text: '#312E81',
    subText: '#4F46E5',
    swatch: '#4F46E5'
  },
  {
    codeIndex: 8,
    name: 'Lime Olive',
    bg: '#F7FEE7',
    border: '#A3E635',
    badgeBg: '#3F6212',
    badgeText: '#FFFFFF',
    text: '#365314',
    subText: '#4D7C0F',
    swatch: '#65A30D'
  },
  {
    codeIndex: 9,
    name: 'Fuchsia Plum',
    bg: '#FDF4FF',
    border: '#E879F9',
    badgeBg: '#86198F',
    badgeText: '#FFFFFF',
    text: '#701A75',
    subText: '#A21CAF',
    swatch: '#C026D3'
  }
];

// Helper to build a full theme object from a single hex color (when user picks custom color)
function createThemeFromHex(hex, index) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 37;
  const g = parseInt(clean.substring(2, 4), 16) || 99;
  const b = parseInt(clean.substring(4, 6), 16) || 235;

  // Light tint for card background (mix 90% white + 10% color)
  const bgR = Math.round(255 * 0.9 + r * 0.1);
  const bgG = Math.round(255 * 0.9 + g * 0.1);
  const bgB = Math.round(255 * 0.9 + b * 0.1);

  // Mid tint for border (mix 45% white + 55% color)
  const brR = Math.round(255 * 0.4 + r * 0.6);
  const brG = Math.round(255 * 0.4 + g * 0.6);
  const brB = Math.round(255 * 0.4 + b * 0.6);

  // Dark shade for text (mix 35% black + 65% color)
  const txR = Math.round(r * 0.55);
  const txG = Math.round(g * 0.55);
  const txB = Math.round(b * 0.55);

  const toHex = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');

  return {
    codeIndex: index,
    name: 'Custom',
    bg: `#${toHex(bgR)}${toHex(bgG)}${toHex(bgB)}`,
    border: `#${toHex(brR)}${toHex(brG)}${toHex(brB)}`,
    badgeBg: `#${toHex(txR)}${toHex(txG)}${toHex(txB)}`,
    badgeText: '#FFFFFF',
    text: `#${toHex(Math.round(r * 0.4))}${toHex(Math.round(g * 0.4))}${toHex(Math.round(b * 0.4))}`,
    subText: hex,
    swatch: hex
  };
}

// Convert index 0 -> 'A', 1 -> 'B', etc.
function getCodeLetter(index) {
  return String.fromCharCode(65 + index);
}

// Generate sample student IDs preserving leading zeros if needed
function generateSampleStudentIds(count, prefix = '2251') {
  const list = [];
  for (let i = 1; i <= count; i++) {
    list.push(`${prefix}${String(i).padStart(4, '0')}`);
  }
  return list.join('\n');
}

// ============================================================================
// 2. STUDENT ID PARSER & DUPLICATE DETECTOR
// ============================================================================
function parseStudentInput(rawText) {
  if (!rawText || !rawText.trim()) {
    return {
      allTokens: [],
      uniqueIds: [],
      duplicates: [],
      duplicateCount: 0
    };
  }

  // Split by newline, comma, semicolon, tab, or whitespace
  const tokens = rawText
    .split(/[\r\n,;\t\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const seen = new Set();
  const duplicatesSet = new Set();
  const uniqueIds = [];

  for (const token of tokens) {
    if (seen.has(token)) {
      duplicatesSet.add(token);
    } else {
      seen.add(token);
      uniqueIds.push(token);
    }
  }

  return {
    allTokens: tokens,
    uniqueIds,
    duplicates: Array.from(duplicatesSet),
    duplicateCount: tokens.length - uniqueIds.length
  };
}

// ============================================================================
// 3. CONSTRAINT-BASED SEATING ALGORITHM & VALIDATION ENGINE
// ============================================================================

/**
 * Fisher-Yates unbiased array shuffle
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/**
 * Constraint-Based Exam Seating Generator
 *
 * Guarantees:
 * 1. Student positions are randomly shuffled (never ordered by MSSV).
 * 2. Every student at (row, col) has a different exam code from:
 *    - Left neighbor (row, col - 1)
 *    - Right neighbor (row, col + 1)
 *    - Front neighbor (row - 1, col)
 *    - Back neighbor (row + 1, col)
 * 3. Exam code counts are strictly balanced: maxCount - minCount <= 1
 *    across all exam codes whenever mathematically possible.
 */
function generateValidSeatingArrangement(studentIds, numCodes, seatsPerRow) {
  const N = studentIds.length;
  const cols = Math.max(1, seatsPerRow);
  const K = Math.max(2, Math.min(10, numCodes));

  if (N === 0) {
    return {
      seats: [],
      rows: 0,
      cols
    };
  }

  const totalRows = Math.ceil(N / cols);
  const totalGridSeats = totalRows * cols;

  // Step 1: Randomly shuffle the student IDs so ID order has zero correlation with seat or code
  const shuffledStudents = shuffleArray(studentIds);

  // Step 2: Solve the 2D Grid Coloring + Quota Balance Constraint Problem for seats 0 .. N-1
  const assignedCodes = new Array(N).fill(-1);

  if (K === 2) {
    // For K = 2 exam codes:
    // A 2D grid has a unique 2-coloring up to parity swap: (row + col + parity) % 2.
    // This guarantees 0 horizontal and 0 vertical conflicts AND differs by at most 1
    // in code distribution for both even and odd column counts!
    const randomParity = Math.random() < 0.5 ? 0 : 1;
    for (let i = 0; i < N; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      assignedCodes[i] = (r + c + randomParity) % 2;
    }
  } else {
    // For K >= 3 exam codes:
    // Calculate exact balanced target quotas for each of the K codes:
    // Each code gets either floor(N / K) or ceil(N / K) seats.
    const baseQuota = Math.floor(N / K);
    const remainder = N % K;

    // Randomly decide which codes receive the +1 remainder
    const codeOrder = shuffleArray(Array.from({ length: K }, (_, idx) => idx));
    const remainingQuota = new Array(K).fill(baseQuota);
    for (let r = 0; r < remainder; r++) {
      remainingQuota[codeOrder[r]] += 1;
    }

    // Backtracking solver with highest-remaining-quota heuristic + random tie-breaking.
    // Because K >= 3 and each cell (r, c) only has at most 2 already-assigned neighbors
    // (Left at c-1 and Front at r-1), there is always at least 1 valid color available,
    // and prioritizing codes with the largest remaining quota keeps all quotas balanced
    // at every prefix of the grid.
    let steps = 0;
    const maxSteps = 80000;

    // Pre-generate random tie-breaker weights per position to keep arrangements diverse
    const randomTieWeights = Array.from({ length: N }, () =>
      shuffleArray(Array.from({ length: K }, (_, idx) => idx))
    );

    const solve = (pos) => {
      if (pos === N) return true;
      steps++;
      if (steps > maxSteps) return false;

      const r = Math.floor(pos / cols);
      const c = pos % cols;

      const leftCode = c > 0 ? assignedCodes[pos - 1] : -1;
      const topCode = r > 0 ? assignedCodes[pos - cols] : -1;

      // Gather valid candidate codes that still have quota > 0
      const candidates = [];
      const tieOrder = randomTieWeights[pos];

      for (let idx = 0; idx < K; idx++) {
        const code = tieOrder[idx];
        if (remainingQuota[code] > 0 && code !== leftCode && code !== topCode) {
          candidates.push(code);
        }
      }

      // Sort candidates descending by remainingQuota (tie-broken by randomTieWeights order)
      candidates.sort((a, b) => remainingQuota[b] - remainingQuota[a]);

      for (let i = 0; i < candidates.length; i++) {
        const chosen = candidates[i];
        assignedCodes[pos] = chosen;
        remainingQuota[chosen]--;

        if (solve(pos + 1)) {
          return true;
        }

        // Backtrack
        remainingQuota[chosen]++;
        assignedCodes[pos] = -1;
      }

      return false;
    };

    const solvedExact = solve(0);

    // Fallback safety (in case an extreme edge-case grid hits maxSteps):
    // Greedy least-used valid neighbor-safe assignment (always 0 adjacency conflicts)
    if (!solvedExact) {
      const counts = new Array(K).fill(0);
      for (let pos = 0; pos < N; pos++) {
        const r = Math.floor(pos / cols);
        const c = pos % cols;
        const leftCode = c > 0 ? assignedCodes[pos - 1] : -1;
        const topCode = r > 0 ? assignedCodes[pos - cols] : -1;

        const validCodes = shuffleArray(Array.from({ length: K }, (_, idx) => idx))
          .filter((code) => code !== leftCode && code !== topCode)
          .sort((a, b) => counts[a] - counts[b]);

        const pick = validCodes[0];
        assignedCodes[pos] = pick;
        counts[pick]++;
      }
    }
  }

  // Step 3: Build the full classroom seat grid (including trailing empty seats in the last row)
  const seats = [];
  for (let i = 0; i < totalGridSeats; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    if (i < N) {
      const codeIdx = assignedCodes[i];
      seats.push({
        seatIndex: i,
        row,
        col,
        isEmpty: false,
        studentId: shuffledStudents[i],
        codeIndex: codeIdx,
        codeLabel: `Code ${getCodeLetter(codeIdx)}`
      });
    } else {
      seats.push({
        seatIndex: i,
        row,
        col,
        isEmpty: true,
        studentId: null,
        codeIndex: null,
        codeLabel: null
      });
    }
  }

  return {
    seats,
    rows: totalRows,
    cols
  };
}

/**
 * Real-Time Seating Arrangement Validator
 *
 * Checks:
 * 1. Horizontal adjacency conflicts (Left / Right)
 * 2. Vertical adjacency conflicts (Front / Back)
 * 3. Student uniqueness & completeness
 * 4. Exam code balance (maxCount - minCount <= 1)
 */
function validateSeatingArrangement(seats, cols, numCodes, expectedStudentCount) {
  const totalSeats = seats.length;
  const rows = cols > 0 ? Math.ceil(totalSeats / cols) : 0;

  // Map seatIndex -> Set of conflict directions ('Left', 'Right', 'Front', 'Back')
  const seatConflicts = new Map();
  const conflictPairs = [];

  const addConflictDirection = (idx, dir) => {
    if (!seatConflicts.has(idx)) {
      seatConflicts.set(idx, new Set());
    }
    seatConflicts.get(idx).add(dir);
  };

  let horizontalConflictCount = 0;
  let verticalConflictCount = 0;

  for (let i = 0; i < totalSeats; i++) {
    const current = seats[i];
    if (!current || current.isEmpty || current.codeIndex === null) continue;

    const r = Math.floor(i / cols);
    const c = i % cols;

    // Check Right neighbor (horizontal)
    if (c + 1 < cols && i + 1 < totalSeats) {
      const right = seats[i + 1];
      if (right && !right.isEmpty && right.codeIndex === current.codeIndex) {
        horizontalConflictCount++;
        addConflictDirection(i, 'Right');
        addConflictDirection(i + 1, 'Left');
        conflictPairs.push({
          type: 'Horizontal',
          codeIndex: current.codeIndex,
          codeLabel: `Code ${getCodeLetter(current.codeIndex)}`,
          seatA: { index: i, row: r + 1, col: c + 1, studentId: current.studentId },
          seatB: { index: i + 1, row: r + 1, col: c + 2, studentId: right.studentId }
        });
      }
    }

    // Check Back neighbor (vertical)
    if (r + 1 < rows && i + cols < totalSeats) {
      const bottom = seats[i + cols];
      if (bottom && !bottom.isEmpty && bottom.codeIndex === current.codeIndex) {
        verticalConflictCount++;
        addConflictDirection(i, 'Back');
        addConflictDirection(i + cols, 'Front');
        conflictPairs.push({
          type: 'Vertical',
          codeIndex: current.codeIndex,
          codeLabel: `Code ${getCodeLetter(current.codeIndex)}`,
          seatA: { index: i, row: r + 1, col: c + 1, studentId: current.studentId },
          seatB: { index: i + cols, row: r + 2, col: c + 1, studentId: bottom.studentId }
        });
      }
    }
  }

  // Count students & distribution per code
  const codeCounts = new Array(numCodes).fill(0);
  const seenStudents = new Set();
  let duplicateStudentInChart = false;
  let seatedStudentCount = 0;
  let emptySeatCount = 0;

  for (const seat of seats) {
    if (!seat || seat.isEmpty || !seat.studentId) {
      emptySeatCount++;
    } else {
      seatedStudentCount++;
      if (seenStudents.has(seat.studentId)) {
        duplicateStudentInChart = true;
      }
      seenStudents.add(seat.studentId);
      if (seat.codeIndex !== null && seat.codeIndex >= 0 && seat.codeIndex < numCodes) {
        codeCounts[seat.codeIndex]++;
      }
    }
  }

  const activeCounts = seatedStudentCount > 0 ? codeCounts : [0];
  const maxCodeCount = Math.max(...activeCounts);
  const minCodeCount = Math.min(...activeCounts);
  const isBalanced = maxCodeCount - minCodeCount <= 1;

  const isComplete =
    !duplicateStudentInChart &&
    (expectedStudentCount === undefined || seatedStudentCount === expectedStudentCount);

  const conflictingSeatCount = seatConflicts.size;
  const totalConflictPairs = horizontalConflictCount + verticalConflictCount;
  const isValid = totalConflictPairs === 0 && isComplete && seatedStudentCount > 0;

  return {
    isValid,
    totalConflictPairs,
    horizontalConflictCount,
    verticalConflictCount,
    conflictingSeatCount,
    seatConflicts,
    conflictPairs,
    codeCounts,
    maxCodeCount,
    minCodeCount,
    isBalanced,
    isComplete,
    seatedStudentCount,
    emptySeatCount,
    rows,
    cols
  };
}

// ============================================================================
// 4. HIGH-RESOLUTION CANVAS & GENUINE A4 LANDSCAPE PDF EXPORT ENGINE
// ============================================================================

/**
 * Renders a single page (or complete chart) of the Seating Arrangement onto an
 * HTML5 Canvas with sharp 2x Retina typography, colors, legend, and row numbers.
 */
function renderSeatingPageToCanvas({
  seats,
  cols,
  startRow,
  endRow,
  totalRows,
  codeThemes,
  numCodes,
  validation,
  examMeta,
  highlightConflicts,
  pageNumber,
  totalPages
}) {
  const scale = 2; // 2x Retina DPI
  // Standard A4 Landscape aspect ratio at 1400px base width -> 1400 x 990
  const width = 1400;
  const rowsInPage = endRow - startRow;
  // Dynamically expand height if rendering a single tall PNG, or lock to A4 landscape ratio for paged PDF
  const isPagedPdf = totalPages !== undefined && totalPages > 0;
  const rowHeight = isPagedPdf ? Math.min(82, Math.max(54, Math.floor(540 / Math.max(1, rowsInPage)))) : 82;
  const headerHeight = 225;
  const footerHeight = 65;
  const chartBodyHeight = rowsInPage * (rowHeight + 12) + 50;
  const height = isPagedPdf ? 990 : Math.max(760, headerHeight + chartBodyHeight + footerHeight);

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Helper for rounded rectangles
  const roundRect = (x, y, w, h, r) => {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  };

  // 1. Page Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const padX = 48;
  let curY = 34;

  // 2. Top Exam Info Header
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(examMeta.title || 'Examination Seating Plan', padX, curY + 20);

  ctx.fillStyle = '#475569';
  ctx.font = '500 13px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
  const metaParts = [
    examMeta.room ? `Room: ${examMeta.room}` : null,
    examMeta.date ? `Date: ${examMeta.date}` : null,
    `Students: ${validation.seatedStudentCount}`,
    `Exam Codes: ${numCodes}`,
    `Layout: ${totalRows} Rows × ${cols} Seats/Row`
  ].filter(Boolean);
  ctx.fillText(metaParts.join('   •   '), padX, curY + 44);

  // Validation Badge on Top Right
  const statusGood = validation.totalConflictPairs === 0;
  const badgeW = 250;
  const badgeH = 34;
  const badgeX = width - padX - badgeW;
  roundRect(badgeX, curY + 4, badgeW, badgeH, 8);
  ctx.fillStyle = statusGood ? '#ECFDF5' : '#FEF2F2';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = statusGood ? '#10B981' : '#EF4444';
  ctx.stroke();

  ctx.fillStyle = statusGood ? '#065F46' : '#991B1B';
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    statusGood
      ? '✓ VALIDATED: 0 ADJACENCY CONFLICTS'
      : `! WARNING: ${validation.totalConflictPairs} CONFLICT(S) DETECTED`,
    badgeX + badgeW / 2,
    curY + 25
  );

  curY += 62;

  // 3. Exam Code Legend Bar
  roundRect(padX, curY, width - padX * 2, 42, 8);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#E2E8F0';
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('EXAM CODE LEGEND:', padX + 16, curY + 25);

  let legendX = padX + 148;
  for (let c = 0; c < numCodes; c++) {
    const theme = codeThemes[c] || DEFAULT_CODE_PALETTE[c % DEFAULT_CODE_PALETTE.length];
    const count = validation.codeCounts[c] || 0;
    const itemW = Math.min(112, Math.floor((width - padX * 2 - 160) / numCodes) - 6);

    roundRect(legendX, curY + 8, itemW, 26, 6);
    ctx.fillStyle = theme.bg;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = theme.border;
    ctx.stroke();

    // Small color dot
    ctx.beginPath();
    ctx.arc(legendX + 13, curY + 21, 5, 0, Math.PI * 2);
    ctx.fillStyle = theme.badgeBg;
    ctx.fill();

    ctx.fillStyle = theme.text;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Code ${getCodeLetter(c)} (${count})`, legendX + 24, curY + 25);

    legendX += itemW + 8;
  }

  curY += 54;

  // 4. Teacher / Blackboard Indicator (Front of Classroom)
  const boardW = Math.min(680, width - padX * 2 - 120);
  const boardX = (width - boardW) / 2;
  roundRect(boardX, curY, boardW, 34, 8);
  ctx.fillStyle = '#1E293B';
  ctx.fill();

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TEACHER DESK / BLACKBOARD  —  FRONT OF CLASSROOM', width / 2, curY + 21);

  curY += 46;

  // 5. Column Headers (Seat 1, Seat 2, ...)
  const rowLabelWidth = 86;
  const gridAreaWidth = width - padX * 2 - rowLabelWidth;
  const colGap = 14;
  const cardWidth = (gridAreaWidth - colGap * (cols - 1)) / cols;

  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  for (let c = 0; c < cols; c++) {
    const colCenterX = padX + rowLabelWidth + c * (cardWidth + colGap) + cardWidth / 2;
    ctx.fillText(`SEAT ${c + 1}`, colCenterX, curY + 14);
  }

  curY += 24;

  // 6. Render Rows (startRow .. endRow - 1)
  for (let r = startRow; r < endRow; r++) {
    // Row label pill on the left
    roundRect(padX, curY + 6, rowLabelWidth - 14, rowHeight - 12, 8);
    ctx.fillStyle = '#F1F5F9';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#CBD5E1';
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`ROW ${r + 1}`, padX + (rowLabelWidth - 14) / 2, curY + rowHeight / 2 + 4);

    // Seats in this row
    for (let c = 0; c < cols; c++) {
      const seatIdx = r * cols + c;
      const seat = seats[seatIdx];
      const cardX = padX + rowLabelWidth + c * (cardWidth + colGap);
      const cardY = curY;

      if (!seat || seat.isEmpty) {
        // Empty Seat Card
        roundRect(cardX, cardY, cardWidth, rowHeight, 10);
        ctx.fillStyle = '#F8FAFC';
        ctx.fill();
        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#CBD5E1';
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '500 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`R${r + 1}•S${c + 1} — EMPTY`, cardX + cardWidth / 2, cardY + rowHeight / 2 + 4);
      } else {
        const theme =
          codeThemes[seat.codeIndex] ||
          DEFAULT_CODE_PALETTE[seat.codeIndex % DEFAULT_CODE_PALETTE.length];
        const hasConflict = highlightConflicts && validation.seatConflicts.has(seatIdx);

        roundRect(cardX, cardY, cardWidth, rowHeight, 10);
        ctx.fillStyle = theme.bg;
        ctx.fill();
        ctx.lineWidth = hasConflict ? 2.5 : 1.75;
        ctx.strokeStyle = hasConflict ? '#DC2626' : theme.border;
        ctx.stroke();

        // Top meta line inside card: Seat coordinate on left, Code Pill on right
        ctx.fillStyle = theme.subText;
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`R${r + 1} • S${c + 1}`, cardX + 12, cardY + 18);

        // Exam Code Pill on top-right of card
        const pillW = Math.min(68, cardWidth * 0.42);
        const pillH = 18;
        const pillX = cardX + cardWidth - pillW - 10;
        const pillY = cardY + 6;
        roundRect(pillX, pillY, pillW, pillH, 5);
        ctx.fillStyle = hasConflict ? '#DC2626' : theme.badgeBg;
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `CODE ${getCodeLetter(seat.codeIndex)}`,
          pillX + pillW / 2,
          pillY + 12.5
        );

        // Student ID (MSSV) prominently in center/bottom
        ctx.fillStyle = theme.text;
        const idFontSize = cardWidth < 130 ? 13 : rowHeight < 64 ? 15 : 17;
        ctx.font = `bold ${idFontSize}px "JetBrains Mono", "Fira Code", monospace, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(
          String(seat.studentId),
          cardX + cardWidth / 2,
          cardY + rowHeight * 0.68
        );

        // Conflict label if applicable
        if (hasConflict) {
          const dirs = Array.from(validation.seatConflicts.get(seatIdx) || []).join('/');
          ctx.fillStyle = '#DC2626';
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`! Conflict (${dirs})`, cardX + cardWidth / 2, cardY + rowHeight - 6);
        }
      }
    }

    curY += rowHeight + 12;
  }

  // 7. Back of Classroom Footer
  const footerY = height - 38;
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BACK OF CLASSROOM', width / 2, footerY);

  if (isPagedPdf) {
    ctx.textAlign = 'right';
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillText(
      `Page ${pageNumber} of ${totalPages}  (Rows ${startRow + 1}–${endRow} of ${totalRows})`,
      width - padX,
      footerY
    );
  }

  return canvas;
}

/**
 * Pure JavaScript Minimal PDF 1.4 Generator from Canvas JPEGs.
 * Builds a genuine, standards-compliant multi-page A4 Landscape PDF (841.89 x 595.28 pt)
 * with zero external library dependencies so PDF export works 100% reliably offline or online.
 */
function buildPdfFromCanvases(canvases) {
  const pageWidthPt = 841.89; // A4 Landscape width in points
  const pageHeightPt = 595.28; // A4 Landscape height in points

  const encoder = new TextEncoder();
  const chunks = [];
  let byteOffset = 0;

  const pushString = (str) => {
    const bytes = encoder.encode(str);
    chunks.push(bytes);
    byteOffset += bytes.length;
  };

  const pushBytes = (bytes) => {
    chunks.push(bytes);
    byteOffset += bytes.length;
  };

  const offsets = [];
  const startObj = (id) => {
    offsets[id] = byteOffset;
    pushString(`${id} 0 obj\n`);
  };
  const endObj = () => {
    pushString(`\nendobj\n`);
  };

  pushString(`%PDF-1.4\n%\xFF\xFF\xFF\xFF\n`);

  // Object 1: Catalog
  startObj(1);
  pushString(`<< /Type /Catalog /Pages 2 0 R >>`);
  endObj();

  const numPages = canvases.length;
  const pageObjIds = [];
  for (let i = 0; i < numPages; i++) {
    pageObjIds.push(3 + i * 3);
  }

  // Object 2: Pages
  startObj(2);
  pushString(
    `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${numPages} >>`
  );
  endObj();

  // For each page: Page object (id), Content stream object (id+1), Image XObject (id+2)
  for (let i = 0; i < numPages; i++) {
    const canvas = canvases[i];
    const pageId = 3 + i * 3;
    const contentId = pageId + 1;
    const imageId = pageId + 2;

    // Convert canvas to high-quality JPEG binary bytes
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const base64Data = dataUrl.split(',')[1];
    const binaryStr = atob(base64Data);
    const imgBytes = new Uint8Array(binaryStr.length);
    for (let j = 0; j < binaryStr.length; j++) {
      imgBytes[j] = binaryStr.charCodeAt(j);
    }

    // Page Object
    startObj(pageId);
    pushString(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] /Resources << /XObject << /Im${i} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    endObj();

    // Content Stream (draws the image scaled cleanly across the A4 Landscape page)
    const contentStr = `q\n${pageWidthPt} 0 0 ${pageHeightPt} 0 0 cm\n/Im${i} Do\nQ`;
    const contentBytes = encoder.encode(contentStr);
    startObj(contentId);
    pushString(`<< /Length ${contentBytes.length} >>\nstream\n`);
    pushBytes(contentBytes);
    pushString(`\nendstream`);
    endObj();

    // Image XObject
    startObj(imageId);
    pushString(
      `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`
    );
    pushBytes(imgBytes);
    pushString(`\nendstream`);
    endObj();
  }

  // XRef Table
  const totalObjects = 2 + numPages * 3;
  const xrefOffset = byteOffset;
  pushString(`xref\n0 ${totalObjects + 1}\n`);
  pushString(`0000000000 65535 f \n`);
  for (let id = 1; id <= totalObjects; id++) {
    pushString(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
  }

  pushString(
    `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  return new Blob(chunks, { type: 'application/pdf' });
}

// ============================================================================
// 5. AUTOMATED TEST CASES CONFIGURATION
// ============================================================================
const REQUIRED_TEST_CASES = [
  { id: 'tc-1', label: '20 Students, 3 Exam Codes', students: 20, codes: 3, cols: 4 },
  { id: 'tc-2', label: '40 Students, 3 Exam Codes', students: 40, codes: 3, cols: 4 },
  { id: 'tc-3', label: '100 Students, 3 Exam Codes', students: 100, codes: 3, cols: 4 },
  { id: 'tc-4', label: '100 Students, 2 Exam Codes', students: 100, codes: 2, cols: 4 },
  { id: 'tc-5', label: '37 Students, 3 Exam Codes (Incomplete Last Row)', students: 37, codes: 3, cols: 4 },
  { id: 'tc-6', label: '200 Students, 5 Exam Codes (Large Room)', students: 200, codes: 5, cols: 4 }
];

// ============================================================================
// 6. MAIN APPLICATION COMPONENT
// ============================================================================
const STORAGE_KEY = 'exam_seating_planner_v1';

export default function App() {
  // --------------------------------------------------------------------------
  // State Initialization (with LocalStorage Persistence)
  // --------------------------------------------------------------------------
  const [studentInput, setStudentInput] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.studentInput === 'string') return parsed.studentInput;
      }
    } catch (e) {
      // Ignore storage errors
    }
    return generateSampleStudentIds(24);
  });

  const [numCodes, setNumCodes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.numCodes >= 2 && parsed.numCodes <= 10) return parsed.numCodes;
      }
    } catch (e) {}
    return 3;
  });

  const [seatsPerRow, setSeatsPerRow] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.seatsPerRow >= 2 && parsed.seatsPerRow <= 10) return parsed.seatsPerRow;
      }
    } catch (e) {}
    return 4;
  });

  // Track the configuration that was used when the current chart was generated
  const [appliedConfig, setAppliedConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.appliedConfig) return parsed.appliedConfig;
      }
    } catch (e) {}
    return { numCodes: 3, seatsPerRow: 4, studentCount: 24 };
  });

  const [codeThemes, setCodeThemes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.codeThemes) && parsed.codeThemes.length === 10) {
          return parsed.codeThemes;
        }
      }
    } catch (e) {}
    return DEFAULT_CODE_PALETTE;
  });

  const [examMeta, setExamMeta] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.examMeta) return parsed.examMeta;
      }
    } catch (e) {}
    return {
      title: 'Midterm Examination — Computer Networks',
      room: 'Hall B1-302',
      date: new Date().toISOString().slice(0, 10)
    };
  });

  // Current seating arrangement & initial generated baseline (for Reset)
  const [seats, setSeats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.seats) && parsed.seats.length > 0) {
          return parsed.seats;
        }
      }
    } catch (e) {}
    const initialIds = parseStudentInput(generateSampleStudentIds(24)).uniqueIds;
    return generateValidSeatingArrangement(initialIds, 3, 4).seats;
  });

  const [initialGeneratedSeats, setInitialGeneratedSeats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.initialGeneratedSeats) && parsed.initialGeneratedSeats.length > 0) {
          return parsed.initialGeneratedSeats;
        }
      }
    } catch (e) {}
    return [];
  });

  // Ensure initialGeneratedSeats is populated on first load
  useEffect(() => {
    if (initialGeneratedSeats.length === 0 && seats.length > 0) {
      setInitialGeneratedSeats(seats);
    }
  }, [initialGeneratedSeats.length, seats]);

  // Undo History Stack for manual drag-and-drop moves
  const [undoStack, setUndoStack] = useState([]);

  // UI Toggles & Interaction State
  const [highlightConflicts, setHighlightConflicts] = useState(true);
  const [draggedSeatIndex, setDraggedSeatIndex] = useState(null);
  const [dragOverSeatIndex, setDragOverSeatIndex] = useState(null);
  const [selectedSeatForSwap, setSelectedSeatForSwap] = useState(null);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showTestSuiteModal, setShowTestSuiteModal] = useState(false);
  const [testSuiteResults, setTestSuiteResults] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const toastTimerRef = useRef(null);

  const showToast = useCallback((text, type = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage({ text, type });
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3600);
  }, []);

  // --------------------------------------------------------------------------
  // Save State to LocalStorage
  // --------------------------------------------------------------------------
  useEffect(() => {
    try {
      const payload = {
        studentInput,
        numCodes,
        seatsPerRow,
        appliedConfig,
        codeThemes,
        examMeta,
        seats,
        initialGeneratedSeats
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // Quota or private browsing safety
    }
  }, [
    studentInput,
    numCodes,
    seatsPerRow,
    appliedConfig,
    codeThemes,
    examMeta,
    seats,
    initialGeneratedSeats
  ]);

  // --------------------------------------------------------------------------
  // Derived Input Parsing & Live Validation
  // --------------------------------------------------------------------------
  const parsedInput = useMemo(() => parseStudentInput(studentInput), [studentInput]);

  // Active grid dimensions come from appliedConfig so changing sidebar inputs
  // doesn't corrupt the currently displayed chart before regenerating
  const activeCols = appliedConfig.seatsPerRow || seatsPerRow;
  const activeNumCodes = appliedConfig.numCodes || numCodes;

  const validation = useMemo(
    () =>
      validateSeatingArrangement(
        seats,
        activeCols,
        activeNumCodes,
        appliedConfig.studentCount
      ),
    [seats, activeCols, activeNumCodes, appliedConfig.studentCount]
  );

  // Detect if sidebar settings differ from the currently displayed arrangement
  const hasPendingConfigChanges =
    numCodes !== appliedConfig.numCodes ||
    seatsPerRow !== appliedConfig.seatsPerRow ||
    parsedInput.uniqueIds.length !== appliedConfig.studentCount;

  // --------------------------------------------------------------------------
  // Core Actions: Generate, Shuffle, Swap, Undo, Reset, Clear
  // --------------------------------------------------------------------------
  const handleRemoveDuplicates = useCallback(() => {
    const cleanText = parsedInput.uniqueIds.join('\n');
    setStudentInput(cleanText);
    showToast(`Removed ${parsedInput.duplicateCount} duplicate student ID(s).`, 'success');
  }, [parsedInput.uniqueIds, parsedInput.duplicateCount, showToast]);

  const handleGenerateSeatingPlan = useCallback(
    (customStudentIds, customNumCodes, customSeatsPerRow, actionLabel = 'Generated valid seating arrangement') => {
      const idsToUse = Array.isArray(customStudentIds)
        ? customStudentIds
        : parsedInput.uniqueIds;
      const codesToUse = customNumCodes ?? numCodes;
      const colsToUse = customSeatsPerRow ?? seatsPerRow;

      if (idsToUse.length === 0) {
        showToast('Please enter at least 1 valid Student ID (MSSV) before generating.', 'error');
        return;
      }

      // If input textarea had duplicates and user clicked Generate directly, auto-clean input
      if (!Array.isArray(customStudentIds) && parsedInput.duplicateCount > 0) {
        setStudentInput(idsToUse.join('\n'));
      }

      const result = generateValidSeatingArrangement(idsToUse, codesToUse, colsToUse);
      setSeats(result.seats);
      setInitialGeneratedSeats(result.seats);
      setAppliedConfig({
        numCodes: codesToUse,
        seatsPerRow: colsToUse,
        studentCount: idsToUse.length
      });
      setUndoStack([]);
      setSelectedSeatForSwap(null);

      showToast(
        `${actionLabel} for ${idsToUse.length} students (${codesToUse} exam codes, ${colsToUse} seats/row).`,
        'success'
      );
    },
    [parsedInput.uniqueIds, parsedInput.duplicateCount, numCodes, seatsPerRow, showToast]
  );

  const handleLoadSample = useCallback(
    (count) => {
      const sampleText = generateSampleStudentIds(count);
      setStudentInput(sampleText);
      const ids = parseStudentInput(sampleText).uniqueIds;
      handleGenerateSeatingPlan(ids, numCodes, seatsPerRow, `Loaded sample of ${count} students`);
    },
    [numCodes, seatsPerRow, handleGenerateSeatingPlan]
  );

  // Swap two seats (preserving each student's assigned exam code!)
  const handleSwapSeats = useCallback(
    (sourceIdx, targetIdx) => {
      if (sourceIdx === null || targetIdx === null || sourceIdx === targetIdx) return;
      const sourceSeat = seats[sourceIdx];
      const targetSeat = seats[targetIdx];
      if (!sourceSeat || !targetSeat) return;
      // Don't swap two empty seats
      if (sourceSeat.isEmpty && targetSeat.isEmpty) return;

      // Save current seats to undo history
      setUndoStack((prev) => [...prev.slice(-49), seats]);

      const nextSeats = seats.map((seat, idx) => {
        if (idx === sourceIdx) {
          return {
            ...seat,
            isEmpty: targetSeat.isEmpty,
            studentId: targetSeat.studentId,
            codeIndex: targetSeat.codeIndex,
            codeLabel: targetSeat.codeLabel
          };
        }
        if (idx === targetIdx) {
          return {
            ...seat,
            isEmpty: sourceSeat.isEmpty,
            studentId: sourceSeat.studentId,
            codeIndex: sourceSeat.codeIndex,
            codeLabel: sourceSeat.codeLabel
          };
        }
        return seat;
      });

      setSeats(nextSeats);
      setSelectedSeatForSwap(null);
    },
    [seats]
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previousSeats = undoStack[undoStack.length - 1];
    setSeats(previousSeats);
    setUndoStack((prev) => prev.slice(0, -1));
    setSelectedSeatForSwap(null);
    showToast('Undid last manual seating adjustment.', 'info');
  }, [undoStack, showToast]);

  const handleResetToGenerated = useCallback(() => {
    if (initialGeneratedSeats.length === 0) return;
    setUndoStack((prev) => [...prev.slice(-49), seats]);
    setSeats(initialGeneratedSeats);
    setSelectedSeatForSwap(null);
    showToast('Reset seating chart to the original conflict-free generated plan.', 'success');
  }, [initialGeneratedSeats, seats, showToast]);

  const handleClearAll = useCallback(() => {
    setStudentInput('');
    setSeats([]);
    setInitialGeneratedSeats([]);
    setUndoStack([]);
    setSelectedSeatForSwap(null);
    setAppliedConfig({ numCodes, seatsPerRow, studentCount: 0 });
    showToast('Cleared student list and seating arrangement.', 'info');
  }, [numCodes, seatsPerRow, showToast]);

  // --------------------------------------------------------------------------
  // Drag and Drop & Click-to-Swap Handlers
  // --------------------------------------------------------------------------
  const onDragStartSeat = (e, seatIndex) => {
    const seat = seats[seatIndex];
    if (!seat || seat.isEmpty) {
      e.preventDefault();
      return;
    }
    setDraggedSeatIndex(seatIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(seatIndex));
  };

  const onDragOverSeat = (e, seatIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSeatIndex !== seatIndex) {
      setDragOverSeatIndex(seatIndex);
    }
  };

  const onDropOnSeat = (e, targetSeatIndex) => {
    e.preventDefault();
    const rawSource = e.dataTransfer.getData('text/plain');
    const sourceIdx = draggedSeatIndex !== null ? draggedSeatIndex : parseInt(rawSource, 10);
    setDraggedSeatIndex(null);
    setDragOverSeatIndex(null);

    if (!Number.isNaN(sourceIdx) && sourceIdx !== targetSeatIndex) {
      handleSwapSeats(sourceIdx, targetSeatIndex);
    }
  };

  const onDragEndSeat = () => {
    setDraggedSeatIndex(null);
    setDragOverSeatIndex(null);
  };

  const onClickSeatCard = (seatIndex) => {
    const clickedSeat = seats[seatIndex];
    if (selectedSeatForSwap === null) {
      // Only allow starting a swap from an occupied seat
      if (!clickedSeat || clickedSeat.isEmpty) return;
      setSelectedSeatForSwap(seatIndex);
    } else if (selectedSeatForSwap === seatIndex) {
      setSelectedSeatForSwap(null);
    } else {
      handleSwapSeats(selectedSeatForSwap, seatIndex);
    }
  };

  // --------------------------------------------------------------------------
  // Export Handlers: PDF (A4 Landscape), PNG Image, Print
  // --------------------------------------------------------------------------
  const handleExportPNG = useCallback(() => {
    if (seats.length === 0) {
      showToast('Generate a seating chart first before exporting.', 'error');
      return;
    }
    setIsExporting(true);
    setTimeout(() => {
      try {
        const totalRows = Math.ceil(seats.length / activeCols);
        const canvas = renderSeatingPageToCanvas({
          seats,
          cols: activeCols,
          startRow: 0,
          endRow: totalRows,
          totalRows,
          codeThemes,
          numCodes: activeNumCodes,
          validation,
          examMeta,
          highlightConflicts,
          pageNumber: 1,
          totalPages: 0
        });

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const safeName = (examMeta.title || 'exam-seating-plan')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        link.download = `${safeName || 'exam-seating-plan'}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Exported high-resolution PNG seating chart.', 'success');
      } catch (err) {
        showToast('Failed to export PNG image.', 'error');
      } finally {
        setIsExporting(false);
      }
    }, 50);
  }, [seats, activeCols, codeThemes, activeNumCodes, validation, examMeta, highlightConflicts, showToast]);

  const handleExportPDF = useCallback(() => {
    if (seats.length === 0) {
      showToast('Generate a seating chart first before exporting PDF.', 'error');
      return;
    }
    setIsExporting(true);
    setTimeout(() => {
      try {
        const totalRows = Math.ceil(seats.length / activeCols);
        // Up to 8 rows per A4 Landscape page so rows are never split awkwardly across pages
        const rowsPerPage = 8;
        const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
        const pageCanvases = [];

        for (let p = 0; p < totalPages; p++) {
          const startRow = p * rowsPerPage;
          const endRow = Math.min(totalRows, startRow + rowsPerPage);
          const pageCanvas = renderSeatingPageToCanvas({
            seats,
            cols: activeCols,
            startRow,
            endRow,
            totalRows,
            codeThemes,
            numCodes: activeNumCodes,
            validation,
            examMeta,
            highlightConflicts,
            pageNumber: p + 1,
            totalPages
          });
          pageCanvases.push(pageCanvas);
        }

        const pdfBlob = buildPdfFromCanvases(pageCanvases);
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        const safeName = (examMeta.title || 'exam-seating-plan')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        link.download = `${safeName || 'exam-seating-plan'}-A4-Landscape.pdf`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 5000);

        showToast(
          `Exported A4 Landscape PDF (${totalPages} page${totalPages > 1 ? 's' : ''}).`,
          'success'
        );
      } catch (err) {
        showToast('Failed to generate PDF file.', 'error');
      } finally {
        setIsExporting(false);
      }
    }, 50);
  }, [seats, activeCols, codeThemes, activeNumCodes, validation, examMeta, highlightConflicts, showToast]);

  const handlePrint = useCallback(() => {
    if (seats.length === 0) {
      showToast('Generate a seating chart first before printing.', 'error');
      return;
    }
    window.print();
  }, [seats.length, showToast]);

  // --------------------------------------------------------------------------
  // Automated Algorithm Verification Test Suite Runner
  // --------------------------------------------------------------------------
  const runAlgorithmTestSuite = useCallback(() => {
    const results = REQUIRED_TEST_CASES.map((tc) => {
      const sampleIds = parseStudentInput(generateSampleStudentIds(tc.students)).uniqueIds;
      const t0 = performance.now();
      const generated = generateValidSeatingArrangement(sampleIds, tc.codes, tc.cols);
      const t1 = performance.now();
      const check = validateSeatingArrangement(
        generated.seats,
        tc.cols,
        tc.codes,
        tc.students
      );

      const passed =
        check.horizontalConflictCount === 0 &&
        check.verticalConflictCount === 0 &&
        check.isComplete &&
        check.isBalanced;

      return {
        ...tc,
        durationMs: (t1 - t0).toFixed(2),
        horizontalConflicts: check.horizontalConflictCount,
        verticalConflicts: check.verticalConflictCount,
        isComplete: check.isComplete,
        isBalanced: check.isBalanced,
        codeCounts: check.codeCounts,
        passed,
        generatedSeats: generated.seats
      };
    });

    setTestSuiteResults(results);
    setShowTestSuiteModal(true);
  }, []);

  // Group seats by row for clean visual rendering
  const seatRows = useMemo(() => {
    if (seats.length === 0) return [];
    const rows = [];
    for (let i = 0; i < seats.length; i += activeCols) {
      rows.push(seats.slice(i, i + activeCols));
    }
    return rows;
  }, [seats, activeCols]);

  // --------------------------------------------------------------------------
  // Render UI
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Dedicated Print Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          body {
            background: #FFFFFF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only-full {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }
          .print-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* ====================================================================
          TOP NAVIGATION BAR
      ==================================================================== */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Grid className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                  Exam Seating Planner
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Classroom Constraint Solver
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Anti-cheating horizontal &amp; vertical exam code seating arrangement utility
              </p>
            </div>
          </div>

          {/* Center Status Pill */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Seated:</span>
              <strong className="font-mono text-slate-900">{validation.seatedStudentCount}</strong>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Exam Codes:</span>
              <strong className="font-mono text-slate-900">{activeNumCodes}</strong>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {seats.length === 0 ? (
                <span className="text-slate-400">No active arrangement</span>
              ) : validation.totalConflictPairs === 0 ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  All Constraints Satisfied (0 Conflicts)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  {validation.totalConflictPairs} Adjacency Conflict
                  {validation.totalConflictPairs > 1 ? 's' : ''} ({validation.conflictingSeatCount} Seats)
                </span>
              )}
            </div>
          </div>

          {/* Right Quick Actions: Algorithm Verification & Export */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runAlgorithmTestSuite}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition cursor-pointer"
              title="Run automated constraint verification on 6 test cases"
            >
              <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Verify Algorithm</span>
            </button>

            <button
              type="button"
              onClick={() => setShowColorModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition cursor-pointer"
              title="Customize exam code colors"
            >
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden md:inline">Code Colors</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting || seats.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 transition shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-300" />
              <span>Export PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportPNG}
              disabled={isExporting || seats.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-40 transition cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">PNG</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={seats.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-40 transition cursor-pointer"
              title="Print Seating Chart (A4 Landscape)"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden xl:inline">Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN WORKSPACE (LEFT INPUT PANEL + RIGHT CLASSROOM CHART)
      ==================================================================== */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==================================================================
            LEFT PANEL: INPUT & CONFIGURATION (4 COLS ON LG, 3 COLS ON XL)
        ================================================================== */}
        <aside className="no-print lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
          {/* A. Student ID Input Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="student-id-textarea"
                className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                1. Student IDs (MSSV)
              </label>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {parsedInput.uniqueIds.length} Valid
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Paste Student IDs separated by lines, commas, spaces, or tabs. Leading zeros are strictly preserved.
            </p>

            {/* Quick Sample Loaders */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] font-semibold uppercase text-slate-400 mr-0.5">
                  Presets:
                </span>
                {[24, 37, 100, 200].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleLoadSample(cnt)}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition cursor-pointer"
                  >
                    {cnt} IDs
                  </button>
                ))}
              </div>

              {studentInput.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setStudentInput('')}
                  className="text-[11px] font-medium text-slate-500 hover:text-red-600 transition cursor-pointer"
                >
                  Clear List
                </button>
              )}
            </div>

            {/* Textarea */}
            <textarea
              id="student-id-textarea"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              rows={8}
              placeholder={'22510001\n22510002\n22510003\n22510004...'}
              className="w-full rounded-lg border border-slate-300 bg-slate-50/60 focus:bg-white px-3 py-2 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition resize-y"
            />

            {/* Duplicate ID Warning Banner */}
            {parsedInput.duplicateCount > 0 && (
              <div className="rounded-lg bg-amber-50 border border-amber-300 p-2.5 flex flex-col gap-1.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <span className="font-bold">
                      {parsedInput.duplicateCount} duplicate entry(s) detected:
                    </span>{' '}
                    <span className="font-mono text-[11px] break-all">
                      {parsedInput.duplicates.slice(0, 5).join(', ')}
                      {parsedInput.duplicates.length > 5
                        ? ` +${parsedInput.duplicates.length - 5} more`
                        : ''}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveDuplicates}
                  className="self-end px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer"
                >
                  Remove Duplicates ({parsedInput.uniqueIds.length} unique kept)
                </button>
              </div>
            )}
          </div>

          {/* B. Exam Code & Seating Configuration Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                2. Room &amp; Code Configuration
              </span>
            </div>

            {/* Number of Exam Codes (2 - 10) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="num-codes-select" className="text-xs font-semibold text-slate-700">
                  Number of Exam Codes
                </label>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {numCodes} Codes (A–{getCodeLetter(numCodes - 1)})
                </span>
              </div>
              <div className="grid grid-cols-9 gap-1 pt-0.5">
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumCodes(n)}
                    className={`py-1.5 rounded-md text-xs font-bold border transition cursor-pointer ${
                      numCodes === n
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Warning if more exam codes than students */}
            {parsedInput.uniqueIds.length > 0 && numCodes > parsedInput.uniqueIds.length && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 flex items-start gap-2 text-xs text-amber-800">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  You selected <strong>{numCodes} exam codes</strong> for only{' '}
                  <strong>{parsedInput.uniqueIds.length} student(s)</strong>. Some exam codes will have 0 students assigned.
                </span>
              </div>
            )}

            {/* Students Per Row (Columns) */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Seats per Row (Columns)
                </label>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {seatsPerRow} Seats / Row
                </span>
              </div>
              <div className="grid grid-cols-9 gap-1 pt-0.5">
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => setSeatsPerRow(cols)}
                    className={`py-1.5 rounded-md text-xs font-bold border transition cursor-pointer ${
                      seatsPerRow === cols
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cols}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Default is 4 seats per horizontal row. Expected rows:{' '}
                <strong className="text-slate-700">
                  {Math.ceil(parsedInput.uniqueIds.length / seatsPerRow)}
                </strong>
              </p>
            </div>

            {/* Active Exam Code Badges Preview */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  Active Code Palette
                </span>
                <button
                  type="button"
                  onClick={() => setShowColorModal(true)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Customize Colors →
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: numCodes }, (_, idx) => {
                  const theme = codeThemes[idx] || DEFAULT_CODE_PALETTE[idx];
                  return (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                        color: theme.text
                      }}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border"
                    >
                      <span
                        style={{ backgroundColor: theme.badgeBg }}
                        className="w-2 h-2 rounded-full"
                      />
                      Code {getCodeLetter(idx)}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* C. Primary Generate & Adjustment Controls Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col gap-3">
            {hasPendingConfigChanges && seats.length > 0 && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-2.5 flex items-start gap-2 text-xs text-blue-900">
                <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Configuration modified.</span> Click{' '}
                  <strong>Generate Seating Plan</strong> below to apply your updated settings (
                  {parsedInput.uniqueIds.length} students, {numCodes} codes, {seatsPerRow} seats/row).
                </div>
              </div>
            )}

            {/* Primary Button: GENERATE SEATING PLAN */}
            <button
              type="button"
              onClick={() =>
                handleGenerateSeatingPlan(
                  undefined,
                  numCodes,
                  seatsPerRow,
                  'Generated new seating plan'
                )
              }
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Generate Seating Plan
            </button>

            {/* Secondary Button: Shuffle Again */}
            <button
              type="button"
              onClick={() =>
                handleGenerateSeatingPlan(
                  undefined,
                  numCodes,
                  seatsPerRow,
                  'Reshuffled students and exam codes'
                )
              }
              disabled={parsedInput.uniqueIds.length === 0}
              className="w-full py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-blue-300" />
              Shuffle Again
            </button>

            {/* Undo / Reset / Clear Row */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="py-2 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-semibold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                title="Undo last manual seat swap"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Undo ({undoStack.length})
              </button>

              <button
                type="button"
                onClick={handleResetToGenerated}
                disabled={undoStack.length === 0 || initialGeneratedSeats.length === 0}
                className="py-2 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-semibold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                title="Reset manual changes back to initial generated plan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                disabled={seats.length === 0 && studentInput.trim().length === 0}
                className="py-2 px-2 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-100/70 disabled:opacity-40 text-red-700 font-semibold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                title="Clear all students and reset classroom"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>

            {/* Conflict Highlighting Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                {highlightConflicts ? (
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
                Highlight Seating Conflicts
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={highlightConflicts}
                onClick={() => setHighlightConflicts((v) => !v)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  highlightConflicts ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    highlightConflicts ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </aside>

        {/* ==================================================================
            MAIN AREA: VISUAL CLASSROOM SEATING CHART & LIVE STATISTICS
        ================================================================== */}
        <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 print-only-full">
          {/* 1. REAL-TIME VALIDATION STATUS BANNER */}
          {seats.length > 0 && (
            <div
              className={`no-print rounded-xl border p-3.5 transition-all ${
                validation.totalConflictPairs === 0
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : 'bg-red-50/95 border-red-300 text-red-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start sm:items-center gap-2.5">
                  {validation.totalConflictPairs === 0 ? (
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xs sm:text-sm font-bold">
                        {validation.totalConflictPairs === 0
                          ? 'All Seating Constraints Satisfied — Ready for Examination'
                          : `Seating Conflicts Detected — ${validation.totalConflictPairs} Adjacent Conflict Pair(s)`}
                      </h2>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          validation.isBalanced
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {validation.isBalanced
                          ? 'Balanced Distribution (±1 max diff)'
                          : 'Custom Distribution'}
                      </span>
                    </div>

                    <p className="text-xs opacity-85 mt-0.5">
                      {validation.totalConflictPairs === 0
                        ? 'No two horizontally (Left/Right) or vertically (Front/Back) adjacent students share the same exam code.'
                        : `${validation.conflictingSeatCount} seats violate adjacency rules (${validation.horizontalConflictCount} horizontal, ${validation.verticalConflictCount} vertical). Drag and drop students or click "Undo" / "Reset" to resolve.`}
                    </p>
                  </div>
                </div>

                {validation.totalConflictPairs > 0 && undoStack.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetToGenerated}
                    className="self-start sm:self-center shrink-0 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Fix All (Reset to Valid)
                  </button>
                )}
              </div>

              {/* Detailed List of Conflicting Seat Pairs when conflicts exist */}
              {validation.conflictPairs.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-red-200/80 flex flex-wrap gap-1.5">
                  {validation.conflictPairs.map((pair, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-red-300 text-[11px] font-medium text-red-900 shadow-2xs"
                    >
                      <span className="font-bold text-red-600 uppercase">{pair.type}:</span>
                      <span>
                        R{pair.seatA.row}•S{pair.seatA.col} ({pair.seatA.studentId})
                      </span>
                      <span>&amp;</span>
                      <span>
                        R{pair.seatB.row}•S{pair.seatB.col} ({pair.seatB.studentId})
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-bold">
                        Both {pair.codeLabel}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. STATISTICS & INTERACTIVE EXAM CODE LEGEND BAR */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col gap-3">
            {/* Compact Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Students
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {validation.seatedStudentCount}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Rows
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {validation.rows}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    (×{activeCols} seats)
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Exam Codes
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {activeNumCodes}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    (A–{getCodeLetter(activeNumCodes - 1)})
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Empty Seats
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {validation.emptySeatCount}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Code Balance
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1">
                  <span className="font-mono">
                    {validation.minCodeCount}–{validation.maxCodeCount}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Δ={validation.maxCodeCount - validation.minCodeCount}
                  </span>
                </div>
              </div>

              <div
                className={`rounded-lg p-2.5 border ${
                  validation.totalConflictPairs === 0
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    validation.totalConflictPairs === 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  Live Conflicts
                </div>
                <div
                  className={`text-lg font-bold font-mono mt-0.5 ${
                    validation.totalConflictPairs === 0 ? 'text-emerald-800' : 'text-red-700'
                  }`}
                >
                  {validation.totalConflictPairs}
                </div>
              </div>
            </div>

            {/* Exam Code Legend & Distribution Counts */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                  Exam Code Distribution:
                </span>
                {Array.from({ length: activeNumCodes }, (_, codeIdx) => {
                  const theme =
                    codeThemes[codeIdx] ||
                    DEFAULT_CODE_PALETTE[codeIdx % DEFAULT_CODE_PALETTE.length];
                  const count = validation.codeCounts[codeIdx] || 0;
                  const pct =
                    validation.seatedStudentCount > 0
                      ? Math.round((count / validation.seatedStudentCount) * 100)
                      : 0;

                  return (
                    <div
                      key={codeIdx}
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                        color: theme.text
                      }}
                      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-bold shadow-2xs"
                    >
                      <span
                        style={{ backgroundColor: theme.badgeBg }}
                        className="px-1.5 py-0.5 rounded text-[10px] font-extrabold text-white tracking-wide"
                      >
                        CODE {getCodeLetter(codeIdx)}
                      </span>
                      <span className="font-mono text-xs">
                        {count} student{count !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] opacity-75 font-mono">({pct}%)</span>
                    </div>
                  );
                })}
              </div>

              <div className="no-print text-[11px] text-slate-500 flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                <span>Drag &amp; drop any seat card or click two seats to swap positions</span>
              </div>
            </div>
          </div>

          {/* 3. VISUAL CLASSROOM SEATING CHART CONTAINER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 flex flex-col gap-5">
            {/* Editable Examination Metadata Header (Included in Print) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600 shrink-0 no-print" />
                  <input
                    type="text"
                    value={examMeta.title}
                    onChange={(e) => setExamMeta((m) => ({ ...m, title: e.target.value }))}
                    placeholder="Enter Examination Title..."
                    className="w-full text-base sm:text-lg font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none px-1 py-0.5 transition"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pl-1">
                  <label className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-500">Room:</span>
                    <input
                      type="text"
                      value={examMeta.room}
                      onChange={(e) => setExamMeta((m) => ({ ...m, room: e.target.value }))}
                      placeholder="e.g. Room B1-302"
                      className="font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:border-blue-600 w-36"
                    />
                  </label>

                  <label className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-500">Exam Date:</span>
                    <input
                      type="date"
                      value={examMeta.date}
                      onChange={(e) => setExamMeta((m) => ({ ...m, date: e.target.value }))}
                      className="font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:border-blue-600"
                    />
                  </label>
                </div>
              </div>

              {/* Selected Seat Swap Helper Pill */}
              {selectedSeatForSwap !== null && seats[selectedSeatForSwap] && (
                <div className="no-print flex items-center gap-2 bg-blue-50 border border-blue-300 text-blue-900 px-3 py-1.5 rounded-lg text-xs font-semibold animate-fade-in">
                  <span>
                    Selected{' '}
                    <strong className="font-mono">
                      {seats[selectedSeatForSwap].studentId}
                    </strong>{' '}
                    (R{seats[selectedSeatForSwap].row + 1}•S{seats[selectedSeatForSwap].col + 1}) —
                    Click any seat to swap
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSeatForSwap(null)}
                    className="p-0.5 rounded hover:bg-blue-200/60 text-blue-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Empty State when 0 students */}
            {seats.length === 0 ? (
              <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-3 bg-slate-50/70 rounded-xl border border-dashed border-slate-300">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-sm font-bold text-slate-800">
                    No Classroom Seating Arrangement Generated
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Paste your Student IDs (MSSV) in the left panel or choose a sample preset, then click{' '}
                    <strong>Generate Seating Plan</strong>.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleLoadSample(24)}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
                  >
                    Load 24 Sample Students
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(37)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                  >
                    Load 37 Sample Students
                  </button>
                </div>
              </div>
            ) : (
              /* Classroom Orientation & Visual Grid */
              <div className="flex flex-col gap-4 overflow-x-auto pb-2">
                <div className="min-w-[640px] flex flex-col gap-4">
                  {/* FRONT OF CLASSROOM / TEACHER BLACKBOARD */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-full max-w-2xl py-2.5 px-6 rounded-xl bg-slate-900 text-white shadow-xs border-b-4 border-blue-500 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                        Front of Room
                      </span>
                      <span className="text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center gap-2">
                        <span>TEACHER DESK / BLACKBOARD</span>
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                        Row 1 Facing
                      </span>
                    </div>
                  </div>

                  {/* COLUMN HEADERS (SEAT 1 .. SEAT K) */}
                  <div className="flex items-center gap-3 pl-20 sm:pl-24 pr-1">
                    <div
                      className="flex-1 grid gap-3"
                      style={{
                        gridTemplateColumns: `repeat(${activeCols}, minmax(130px, 1fr))`
                      }}
                    >
                      {Array.from({ length: activeCols }, (_, colIdx) => (
                        <div
                          key={colIdx}
                          className="text-center py-1 rounded-md bg-slate-100/80 border border-slate-200/70 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                        >
                          Seat {colIdx + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEATING ROWS */}
                  <div className="flex flex-col gap-3">
                    {seatRows.map((rowSeats, rIdx) => (
                      <div
                        key={rIdx}
                        className="print-avoid-break flex items-stretch gap-3 group/row"
                      >
                        {/* Row Label on Left */}
                        <div className="w-16 sm:w-20 shrink-0 rounded-xl bg-slate-100 border border-slate-200/90 flex flex-col items-center justify-center px-2 py-2 select-none">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Row
                          </span>
                          <span className="text-sm sm:text-base font-extrabold font-mono text-slate-700">
                            {rIdx + 1}
                          </span>
                        </div>

                        {/* Seats Grid for this Row */}
                        <div
                          className="flex-1 grid gap-3"
                          style={{
                            gridTemplateColumns: `repeat(${activeCols}, minmax(130px, 1fr))`
                          }}
                        >
                          {rowSeats.map((seat) => {
                            const seatIdx = seat.seatIndex;
                            const isDragged = draggedSeatIndex === seatIdx;
                            const isDropTarget =
                              dragOverSeatIndex === seatIdx &&
                              draggedSeatIndex !== null &&
                              draggedSeatIndex !== seatIdx;
                            const isSelectedForSwap = selectedSeatForSwap === seatIdx;

                            const conflictDirsSet = validation.seatConflicts.get(seatIdx);
                            const hasConflict =
                              highlightConflicts &&
                              !seat.isEmpty &&
                              conflictDirsSet &&
                              conflictDirsSet.size > 0;
                            const conflictDirs = hasConflict
                              ? Array.from(conflictDirsSet)
                              : [];

                            if (seat.isEmpty) {
                              // Empty Seat Slot (in incomplete final row or after moving a student)
                              return (
                                <div
                                  key={seatIdx}
                                  onDragOver={(e) => onDragOverSeat(e, seatIdx)}
                                  onDragLeave={() => setDragOverSeatIndex(null)}
                                  onDrop={(e) => onDropOnSeat(e, seatIdx)}
                                  onClick={() => onClickSeatCard(seatIdx)}
                                  className={`relative min-h-[84px] rounded-xl border-2 border-dashed p-3 flex flex-col items-center justify-center gap-1 transition-all select-none ${
                                    isDropTarget
                                      ? 'border-blue-500 bg-blue-50/70 scale-[1.02] shadow-sm'
                                      : selectedSeatForSwap !== null
                                      ? 'border-blue-300 bg-slate-50 hover:bg-blue-50/40 cursor-pointer'
                                      : 'border-slate-200 bg-slate-50/50 text-slate-400'
                                  }`}
                                >
                                  <span className="text-[10px] font-mono font-semibold text-slate-400">
                                    R{seat.row + 1} • S{seat.col + 1}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-400">
                                    {isDropTarget ? 'Drop Student Here' : 'Empty Seat'}
                                  </span>
                                </div>
                              );
                            }

                            const theme =
                              codeThemes[seat.codeIndex] ||
                              DEFAULT_CODE_PALETTE[
                                seat.codeIndex % DEFAULT_CODE_PALETTE.length
                              ];

                            return (
                              <div
                                key={seatIdx}
                                draggable
                                onDragStart={(e) => onDragStartSeat(e, seatIdx)}
                                onDragOver={(e) => onDragOverSeat(e, seatIdx)}
                                onDragLeave={() => setDragOverSeatIndex(null)}
                                onDrop={(e) => onDropOnSeat(e, seatIdx)}
                                onDragEnd={onDragEndSeat}
                                onClick={() => onClickSeatCard(seatIdx)}
                                style={{
                                  backgroundColor: theme.bg,
                                  borderColor: hasConflict
                                    ? '#DC2626'
                                    : isSelectedForSwap || isDropTarget
                                    ? '#2563EB'
                                    : theme.border
                                }}
                                className={`relative min-h-[86px] rounded-xl border-2 p-2.5 flex flex-col justify-between transition-all duration-150 select-none cursor-grab active:cursor-grabbing ${
                                  isDragged
                                    ? 'opacity-40 scale-95 ring-2 ring-blue-400'
                                    : isDropTarget
                                    ? 'scale-[1.03] ring-4 ring-blue-500/30 shadow-md z-10'
                                    : isSelectedForSwap
                                    ? 'ring-4 ring-blue-500/30 shadow-md z-10'
                                    : hasConflict
                                    ? 'ring-3 ring-red-500/25 shadow-sm'
                                    : 'hover:shadow-md hover:-translate-y-0.5 shadow-2xs'
                                }`}
                                title={`Student ${seat.studentId} (${seat.codeLabel}) — Row ${
                                  seat.row + 1
                                }, Seat ${seat.col + 1}. Drag to swap or click to select.`}
                              >
                                {/* Top Row of Card: Seat Coordinate + Exam Code Badge */}
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    style={{ color: theme.subText }}
                                    className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold"
                                  >
                                    <GripVertical className="w-3 h-3 opacity-60 no-print -ml-1" />
                                    R{seat.row + 1}•S{seat.col + 1}
                                  </span>

                                  <span
                                    style={{
                                      backgroundColor: hasConflict ? '#DC2626' : theme.badgeBg,
                                      color: theme.badgeText
                                    }}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase shadow-2xs"
                                  >
                                    CODE {getCodeLetter(seat.codeIndex)}
                                  </span>
                                </div>

                                {/* Center: Prominent Student ID (MSSV) */}
                                <div className="my-1 text-center">
                                  <div
                                    style={{ color: theme.text }}
                                    className="text-sm sm:text-base font-extrabold font-mono tracking-tight truncate"
                                  >
                                    {seat.studentId}
                                  </div>
                                </div>

                                {/* Bottom Row: Status or Conflict Direction Indicator */}
                                <div className="flex items-center justify-between min-h-[16px]">
                                  {hasConflict ? (
                                    <div className="w-full flex items-center justify-center gap-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                                      <AlertTriangle className="w-3 h-3 shrink-0" />
                                      <span className="truncate">
                                        Conflict: {conflictDirs.join(', ')}
                                      </span>
                                    </div>
                                  ) : isDropTarget ? (
                                    <div className="w-full text-center text-[10px] font-bold text-blue-700 bg-blue-100/90 rounded py-0.5">
                                      Swap Here
                                    </div>
                                  ) : isSelectedForSwap ? (
                                    <div className="w-full text-center text-[10px] font-bold text-blue-700 bg-blue-100/90 rounded py-0.5">
                                      Selected — Click target
                                    </div>
                                  ) : (
                                    <div
                                      style={{ color: theme.subText }}
                                      className="w-full flex items-center justify-between text-[10px] font-medium opacity-75"
                                    >
                                      <span>MSSV</span>
                                      <span className="no-print text-[9px] uppercase tracking-wider">
                                        Drag / Swap
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BACK OF CLASSROOM INDICATOR */}
                  <div className="pt-2 flex flex-col items-center">
                    <div className="w-full max-w-md py-1.5 px-4 rounded-lg bg-slate-100 border border-slate-200 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Back of Classroom
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ====================================================================
          MODAL 1: CUSTOMIZE EXAM CODE COLORS
      ==================================================================== */}
      {showColorModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Customize Exam Code Colors
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowColorModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3 max-h-[65vh] overflow-y-auto">
              <p className="text-xs text-slate-600">
                Choose a custom color for any exam code. Card backgrounds, borders, and high-contrast text shades are automatically computed to preserve readability and print clarity.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {Array.from({ length: numCodes }, (_, idx) => {
                  const theme = codeThemes[idx] || DEFAULT_CODE_PALETTE[idx];
                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border
                      }}
                      className="p-3 rounded-xl border-2 flex items-center justify-between gap-3"
                    >
                      <div>
                        <span
                          style={{
                            backgroundColor: theme.badgeBg,
                            color: theme.badgeText
                          }}
                          className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase"
                        >
                          CODE {getCodeLetter(idx)}
                        </span>
                        <div
                          style={{ color: theme.text }}
                          className="text-xs font-mono font-bold mt-1"
                        >
                          2251000{idx + 1}
                        </div>
                      </div>

                      <label className="flex items-center gap-1.5 cursor-pointer bg-white/90 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700 hover:bg-white">
                        <input
                          type="color"
                          value={theme.swatch}
                          onChange={(e) => {
                            const newHex = e.target.value;
                            setCodeThemes((prev) =>
                              prev.map((t, i) =>
                                i === idx ? createThemeFromHex(newHex, idx) : t
                              )
                            );
                          }}
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span>Pick</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setCodeThemes(DEFAULT_CODE_PALETTE);
                  showToast('Restored default colorblind-safe palette.', 'info');
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Reset to Default Colorblind-Safe Palette
              </button>

              <button
                type="button"
                onClick={() => setShowColorModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: AUTOMATED ALGORITHM VERIFICATION SUITE (6 TEST CASES)
      ==================================================================== */}
      {showTestSuiteModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Automated Seating Algorithm Verification Suite
                  </h3>
                  <p className="text-xs text-slate-500">
                    Testing horizontal adjacency, vertical adjacency, student completeness, and code balance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTestSuiteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-2.5">
                {testSuiteResults.map((res) => (
                  <div
                    key={res.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      res.passed
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">
                            {res.label}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            PASS ({res.durationMs} ms)
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 mt-1 font-mono">
                          <span>Horiz Conflicts: {res.horizontalConflicts}</span>
                          <span>•</span>
                          <span>Vert Conflicts: {res.verticalConflicts}</span>
                          <span>•</span>
                          <span>
                            Distribution: [
                            {res.codeCounts
                              .map((cnt, idx) => `${getCodeLetter(idx)}:${cnt}`)
                              .join(', ')}
                            ]
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const sampleStr = generateSampleStudentIds(res.students);
                        setStudentInput(sampleStr);
                        setNumCodes(res.codes);
                        setSeatsPerRow(res.cols);
                        setSeats(res.generatedSeats);
                        setInitialGeneratedSeats(res.generatedSeats);
                        setAppliedConfig({
                          numCodes: res.codes,
                          seatsPerRow: res.cols,
                          studentCount: res.students
                        });
                        setUndoStack([]);
                        setShowTestSuiteModal(false);
                        showToast(`Loaded test case: ${res.label}`, 'success');
                      }}
                      className="self-end sm:self-center shrink-0 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Load in Classroom →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={runAlgorithmTestSuite}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-Run All 6 Tests
              </button>

              <button
                type="button"
                onClick={() => setShowTestSuiteModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          FLOATING TOAST NOTIFICATION
      ==================================================================== */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 max-w-md animate-bounce-short">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === 'error'
                ? 'bg-red-900 text-white border-red-700'
                : toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export {
  parseStudentInput,
  generateValidSeatingArrangement,
  validateSeatingArrangement,
  generateSampleStudentIds,
  getCodeLetter,
  REQUIRED_TEST_CASES
};
