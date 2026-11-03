import test from 'node:test';
import assert from 'node:assert/strict';

// Core algorithm implementations matching src/App.tsx
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

function getCodeLetter(index) {
  return String.fromCharCode(65 + index);
}

function generateSampleStudentIds(count, prefix = '2251') {
  const list = [];
  for (let i = 1; i <= count; i++) {
    list.push(`${prefix}${String(i).padStart(4, '0')}`);
  }
  return list.join('\n');
}

function parseStudentInput(rawText) {
  if (!rawText || !rawText.trim()) {
    return {
      allTokens: [],
      uniqueIds: [],
      duplicates: [],
      duplicateCount: 0
    };
  }

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

function generateValidSeatingArrangement(studentIds, numCodes, seatsPerRow) {
  const N = studentIds.length;
  const cols = Math.max(1, seatsPerRow);
  const K = Math.max(2, Math.min(10, numCodes));

  if (N === 0) {
    return { seats: [], rows: 0, cols };
  }

  const totalRows = Math.ceil(N / cols);
  const totalGridSeats = totalRows * cols;
  const shuffledStudents = shuffleArray(studentIds);
  const assignedCodes = new Array(N).fill(-1);

  if (K === 2) {
    const randomParity = Math.random() < 0.5 ? 0 : 1;
    for (let i = 0; i < N; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      assignedCodes[i] = (r + c + randomParity) % 2;
    }
  } else {
    const baseQuota = Math.floor(N / K);
    const remainder = N % K;
    const codeOrder = shuffleArray(Array.from({ length: K }, (_, idx) => idx));
    const remainingQuota = new Array(K).fill(baseQuota);
    for (let r = 0; r < remainder; r++) {
      remainingQuota[codeOrder[r]] += 1;
    }

    let steps = 0;
    const maxSteps = 80000;
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

      const candidates = [];
      const tieOrder = randomTieWeights[pos];

      for (let idx = 0; idx < K; idx++) {
        const code = tieOrder[idx];
        if (remainingQuota[code] > 0 && code !== leftCode && code !== topCode) {
          candidates.push(code);
        }
      }

      candidates.sort((a, b) => remainingQuota[b] - remainingQuota[a]);

      for (let i = 0; i < candidates.length; i++) {
        const chosen = candidates[i];
        assignedCodes[pos] = chosen;
        remainingQuota[chosen]--;

        if (solve(pos + 1)) return true;

        remainingQuota[chosen]++;
        assignedCodes[pos] = -1;
      }

      return false;
    };

    const solvedExact = solve(0);

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

  return { seats, rows: totalRows, cols };
}

function validateSeatingArrangement(seats, cols, numCodes, expectedStudentCount) {
  const totalSeats = seats.length;
  const rows = cols > 0 ? Math.ceil(totalSeats / cols) : 0;
  const K = Math.max(2, Math.min(10, numCodes));

  const conflicts = [];
  const conflictingSeatIndices = new Set();
  const codeCounts = new Array(K).fill(0);
  let assignedStudentCount = 0;
  const seenStudentIds = new Set();
  const duplicateIds = new Set();

  for (let i = 0; i < totalSeats; i++) {
    const seat = seats[i];
    if (seat.isEmpty || !seat.studentId) continue;

    assignedStudentCount++;

    if (seenStudentIds.has(seat.studentId)) {
      duplicateIds.add(seat.studentId);
    } else {
      seenStudentIds.add(seat.studentId);
    }

    if (seat.codeIndex !== null && seat.codeIndex !== undefined) {
      if (seat.codeIndex >= 0 && seat.codeIndex < K) {
        codeCounts[seat.codeIndex]++;
      }
    }

    const r = seat.row;
    const c = seat.col;

    // Horizontal neighbor (Right)
    if (c + 1 < cols) {
      const rightIdx = r * cols + (c + 1);
      if (rightIdx < totalSeats) {
        const rightSeat = seats[rightIdx];
        if (
          !rightSeat.isEmpty &&
          rightSeat.studentId &&
          rightSeat.codeIndex === seat.codeIndex
        ) {
          conflicts.push({
            type: 'horizontal',
            seat1: i,
            seat2: rightIdx,
            row: r,
            col1: c,
            col2: c + 1,
            codeIndex: seat.codeIndex
          });
          conflictingSeatIndices.add(i);
          conflictingSeatIndices.add(rightIdx);
        }
      }
    }

    // Vertical neighbor (Down)
    if (r + 1 < rows) {
      const downIdx = (r + 1) * cols + c;
      if (downIdx < totalSeats) {
        const downSeat = seats[downIdx];
        if (
          !downSeat.isEmpty &&
          downSeat.studentId &&
          downSeat.codeIndex === seat.codeIndex
        ) {
          conflicts.push({
            type: 'vertical',
            seat1: i,
            seat2: downIdx,
            col: c,
            row1: r,
            row2: r + 1,
            codeIndex: seat.codeIndex
          });
          conflictingSeatIndices.add(i);
          conflictingSeatIndices.add(downIdx);
        }
      }
    }
  }

  const horizontalConflicts = conflicts.filter((c) => c.type === 'horizontal');
  const verticalConflicts = conflicts.filter((c) => c.type === 'vertical');

  const maxCount = Math.max(...codeCounts);
  const minCount = Math.min(...codeCounts);
  const isBalanced = maxCount - minCount <= 1;
  const isComplete = assignedStudentCount === expectedStudentCount;

  return {
    isValid: conflicts.length === 0 && duplicateIds.size === 0 && isComplete,
    hasConflicts: conflicts.length > 0,
    conflicts,
    conflictingSeatIndices: Array.from(conflictingSeatIndices),
    conflictingSeatCount: conflictingSeatIndices.size,
    horizontalConflictCount: horizontalConflicts.length,
    verticalConflictCount: verticalConflicts.length,
    codeCounts,
    maxCount,
    minCount,
    isBalanced,
    assignedStudentCount,
    expectedStudentCount,
    isComplete,
    duplicateStudentIds: Array.from(duplicateIds)
  };
}

const REQUIRED_TEST_CASES = [
  { id: 'tc-1', label: '20 Students, 3 Exam Codes', students: 20, codes: 3, cols: 4 },
  { id: 'tc-2', label: '40 Students, 3 Exam Codes', students: 40, codes: 3, cols: 4 },
  { id: 'tc-3', label: '100 Students, 3 Exam Codes', students: 100, codes: 3, cols: 4 },
  { id: 'tc-4', label: '100 Students, 2 Exam Codes', students: 100, codes: 2, cols: 4 },
  { id: 'tc-5', label: '37 Students, 3 Exam Codes (Incomplete Last Row)', students: 37, codes: 3, cols: 4 },
  { id: 'tc-6', label: '200 Students, 5 Exam Codes (Large Room)', students: 200, codes: 5, cols: 4 }
];

test('Student ID Parser handles tokens and identifies duplicates', () => {
  const raw = '22510001, 22510002; 22510003\n22510001\t22510004  22510002';
  const res = parseStudentInput(raw);
  assert.equal(res.allTokens.length, 6);
  assert.equal(res.uniqueIds.length, 4);
  assert.equal(res.duplicateCount, 2);
  assert.deepEqual(res.duplicates.sort(), ['22510001', '22510002']);
});

test('Seating Algorithm passes all 6 required benchmark test cases', () => {
  for (const tc of REQUIRED_TEST_CASES) {
    const rawIds = generateSampleStudentIds(tc.students);
    const parsed = parseStudentInput(rawIds);
    const generated = generateValidSeatingArrangement(parsed.uniqueIds, tc.codes, tc.cols);
    const val = validateSeatingArrangement(generated.seats, tc.cols, tc.codes, tc.students);

    assert.equal(val.horizontalConflictCount, 0, `TC ${tc.id}: Expected 0 horizontal conflicts`);
    assert.equal(val.verticalConflictCount, 0, `TC ${tc.id}: Expected 0 vertical conflicts`);
    assert.equal(val.isComplete, true, `TC ${tc.id}: Expected seating completeness`);
    assert.equal(val.isBalanced, true, `TC ${tc.id}: Expected exam code count balance`);
    assert.equal(val.isValid, true, `TC ${tc.id}: Expected valid arrangement`);
  }
});

test('Conflict Detector accurately identifies adjacent duplicate codes', () => {
  const rawIds = generateSampleStudentIds(12);
  const parsed = parseStudentInput(rawIds);
  const generated = generateValidSeatingArrangement(parsed.uniqueIds, 3, 4);
  
  // Inject intentional conflict between seat 0 and seat 1
  generated.seats[0].codeIndex = 0;
  generated.seats[1].codeIndex = 0;

  const val = validateSeatingArrangement(generated.seats, 4, 3, 12);
  assert.equal(val.hasConflicts, true);
  assert.ok(val.horizontalConflictCount >= 1);
  assert.ok(val.conflictingSeatIndices.includes(0));
  assert.ok(val.conflictingSeatIndices.includes(1));
});

