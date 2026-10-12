/**
 * Generates test classroom scenes for instant evaluation across multiple crowd scenarios:
 * - Negative test: 0 students (empty classroom)
 * - Baseline test: 1 student (solo desk)
 * - Small group test: 4 students (seminar table)
 * - Multi-row test: 8 students (lecture hall)
 */

export interface SampleImageItem {
  id: string;
  title: string;
  description: string;
  studentCountLabel: string;
  expectedCount: number;
  scenarioType: 'negative' | 'baseline' | 'small-group' | 'lecture';
  createDataUrl: () => string;
}

/**
 * 1. Negative Test: Empty Lecture Hall (0 Students)
 * Demonstrates that the computer vision model does NOT hallucinate or falsely detect heads on chairs/whiteboards.
 */
function createEmptyClassroomSample(): string {
  const width = 1000;
  const height = 650;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background wall
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#E2E8F0');
  bgGrad.addColorStop(1, '#CBD5E1');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Large Whiteboard
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(150, 40, 700, 220);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 6;
  ctx.strokeRect(150, 40, 700, 220);

  ctx.fillStyle = '#1E3A8A';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText("CS402: Advanced Computer Vision & Pattern Recognition", 200, 95);
  ctx.fillStyle = '#475569';
  ctx.font = '16px sans-serif';
  ctx.fillText("Topic: Convolutional Neural Networks & Feature Pyramids", 230, 135);
  ctx.fillText("Room: LH-302 · Status: Class Concluded / Empty Room", 230, 165);
  ctx.fillText("Attendance System Verification Test: Zero Occupants", 230, 195);

  // Empty Desks & Wooden Chairs
  ctx.fillStyle = '#94704D';
  ctx.fillRect(80, 450, 840, 170);
  ctx.fillStyle = '#B08968';
  ctx.fillRect(90, 455, 820, 20);

  // 4 Empty Chairs (just wooden backrests, no heads/faces)
  const chairPositions = [220, 410, 600, 790];
  chairPositions.forEach((cx) => {
    ctx.fillStyle = '#64748B';
    ctx.fillRect(cx - 25, 340, 50, 70);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.strokeRect(cx - 25, 340, 50, 70);
    // Desk lamp
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(cx + 10, 420, 8, 30);
    ctx.beginPath();
    ctx.arc(cx + 14, 415, 12, Math.PI, 0);
    ctx.fill();
  });

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * 2. Baseline Test: 1 Student at Study Desk
 */
function createSingleStudentSample(): string {
  const width = 1000;
  const height = 650;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background library shelf
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, width, height);

  // Bookshelf background
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(100, 40, 800, 240);
  for (let i = 120; i < 860; i += 28) {
    ctx.fillStyle = i % 56 === 0 ? '#3B82F6' : i % 84 === 0 ? '#10B981' : '#F59E0B';
    ctx.fillRect(i, 80, 20, 160);
  }

  // Wooden desk
  ctx.fillStyle = '#A16207';
  ctx.fillRect(150, 440, 700, 190);
  ctx.fillStyle = '#CA8A04';
  ctx.fillRect(160, 445, 680, 20);

  // Student in the center
  const s = { x: 500, y: 310, skin: '#E0AC69', hair: '#1E293B', shirt: '#2563EB' };

  // Shoulders
  ctx.fillStyle = s.shirt;
  ctx.beginPath();
  ctx.ellipse(s.x, s.y + 130, 85, 65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillStyle = s.skin;
  ctx.fillRect(s.x - 16, s.y + 40, 32, 35);

  // Head
  ctx.beginPath();
  ctx.ellipse(s.x, s.y, 48, 56, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = s.hair;
  ctx.beginPath();
  ctx.arc(s.x, s.y - 14, 50, Math.PI, 0);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(s.x - 18, s.y - 4, 8, 0, Math.PI * 2);
  ctx.arc(s.x + 18, s.y - 4, 8, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(s.x - 18, s.y - 4, 4, 0, Math.PI * 2);
  ctx.arc(s.x + 18, s.y - 4, 4, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = s.hair;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(s.x - 26, s.y - 15);
  ctx.lineTo(s.x - 10, s.y - 15);
  ctx.moveTo(s.x + 10, s.y - 15);
  ctx.lineTo(s.x + 26, s.y - 15);
  ctx.stroke();

  // Nose
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(s.x, s.y - 2);
  ctx.lineTo(s.x + 3, s.y + 11);
  ctx.lineTo(s.x - 3, s.y + 12);
  ctx.stroke();

  // Smile
  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(s.x, s.y + 22, 13, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Open book & laptop on desk
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(s.x - 110, 450, 90, 45);
  ctx.fillStyle = '#64748B';
  ctx.fillRect(s.x + 15, 435, 100, 50);

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * 3. Small Group: Seminar with 4 Students
 */
function createStudyGroupSample(): string {
  const width = 1000;
  const height = 650;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#E2E8F0');
  bgGrad.addColorStop(1, '#CBD5E1');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(150, 40, 700, 200);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 6;
  ctx.strokeRect(150, 40, 700, 200);

  ctx.fillStyle = '#1E3A8A';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText("Data Structures & Algorithms - Lecture 08", 220, 90);
  ctx.fillStyle = '#475569';
  ctx.font = '16px sans-serif';
  ctx.fillText("• Graph Traversal: BFS & DFS Complexity", 240, 130);
  ctx.fillText("• O(V + E) time bound verification", 240, 160);
  ctx.fillText("• Student Attendance Roster: Section B", 240, 190);

  ctx.fillStyle = '#94704D';
  ctx.fillRect(100, 440, 800, 180);
  ctx.fillStyle = '#B08968';
  ctx.fillRect(110, 445, 780, 20);

  const students = [
    { x: 230, y: 310, skin: '#E0AC69', hair: '#262626', hairStyle: 'short', shirt: '#2563EB' },
    { x: 410, y: 295, skin: '#F1C27D', hair: '#5C3826', hairStyle: 'long', shirt: '#059669' },
    { x: 590, y: 305, skin: '#C68642', hair: '#171717', hairStyle: 'curly', shirt: '#D97706' },
    { x: 770, y: 315, skin: '#8D5524', hair: '#0A0A0A', hairStyle: 'fade', shirt: '#7C3AED' },
  ];

  students.forEach((s) => {
    ctx.fillStyle = s.shirt;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y + 130, 75, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = s.skin;
    ctx.fillRect(s.x - 14, s.y + 40, 28, 30);

    ctx.beginPath();
    ctx.ellipse(s.x, s.y, 44, 52, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = s.hair;
    if (s.hairStyle === 'short') {
      ctx.beginPath();
      ctx.arc(s.x, s.y - 12, 46, Math.PI, 0);
      ctx.fill();
    } else if (s.hairStyle === 'long') {
      ctx.beginPath();
      ctx.arc(s.x, s.y - 10, 48, Math.PI, 0);
      ctx.fillRect(s.x - 48, s.y - 10, 14, 70);
      ctx.fillRect(s.x + 34, s.y - 10, 14, 70);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(s.x, s.y - 15, 47, Math.PI * 0.9, Math.PI * 0.1);
      ctx.fill();
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(s.x - 16, s.y - 4, 7, 0, Math.PI * 2);
    ctx.arc(s.x + 16, s.y - 4, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(s.x - 16, s.y - 4, 3.5, 0, Math.PI * 2);
    ctx.arc(s.x + 16, s.y - 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = s.hair;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(s.x - 24, s.y - 14);
    ctx.lineTo(s.x - 8, s.y - 14);
    ctx.moveTo(s.x + 8, s.y - 14);
    ctx.lineTo(s.x + 24, s.y - 14);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y - 2);
    ctx.lineTo(s.x + 3, s.y + 10);
    ctx.lineTo(s.x - 3, s.y + 11);
    ctx.stroke();

    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y + 20, 12, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.fillRect(s.x - 35, 430, 70, 30);
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(s.x - 30, 395, 60, 35);
  });

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * 4. Multi-Row: Classroom Lecture with 8 Students
 */
function createLectureHallSample(): string {
  const width = 1100;
  const height = 700;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#1E293B');
  grad.addColorStop(1, '#334155');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(250, 30, 600, 160);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 4;
  ctx.strokeRect(250, 30, 600, 160);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText("Neural Networks & Computer Vision", 320, 80);
  ctx.fillStyle = '#475569';
  ctx.font = '15px sans-serif';
  ctx.fillText("Real-time Object Localization & Crowd Headcount Analysis", 300, 120);

  ctx.fillStyle = '#475569';
  ctx.fillRect(100, 290, 900, 60);

  const backRow = [
    { x: 230, y: 240, skin: '#F3D2B8', hair: '#2E1C0C' },
    { x: 430, y: 235, skin: '#D19C6E', hair: '#111827' },
    { x: 670, y: 240, skin: '#E8B991', hair: '#5C3826' },
    { x: 870, y: 235, skin: '#A66E4E', hair: '#000000' },
  ];

  backRow.forEach((s) => {
    ctx.fillStyle = '#1E3A8A';
    ctx.beginPath();
    ctx.ellipse(s.x, s.y + 70, 50, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = s.skin;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, 30, 36, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = s.hair;
    ctx.beginPath();
    ctx.arc(s.x, s.y - 8, 32, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(s.x - 10, s.y - 2, 4.5, 0, Math.PI * 2);
    ctx.arc(s.x + 10, s.y - 2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(s.x - 10, s.y - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(s.x + 10, s.y - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y + 14, 8, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  });

  ctx.fillStyle = '#64748B';
  ctx.fillRect(60, 480, 980, 80);

  const frontRow = [
    { x: 200, y: 400, skin: '#F6D5B8', hair: '#7C3AED', shirt: '#047857' },
    { x: 420, y: 395, skin: '#B97A48', hair: '#1F2937', shirt: '#B45309' },
    { x: 680, y: 405, skin: '#E5B188', hair: '#451A03', shirt: '#1E40AF' },
    { x: 900, y: 390, skin: '#8C5329', hair: '#000000', shirt: '#991B1B' },
  ];

  frontRow.forEach((s) => {
    ctx.fillStyle = s.shirt;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y + 100, 68, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = s.skin;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, 40, 48, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = s.hair;
    ctx.beginPath();
    ctx.arc(s.x, s.y - 12, 42, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(s.x - 14, s.y - 4, 6, 0, Math.PI * 2);
    ctx.arc(s.x + 14, s.y - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(s.x - 14, s.y - 4, 3, 0, Math.PI * 2);
    ctx.arc(s.x + 14, s.y - 4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x - 20, s.y - 13);
    ctx.lineTo(s.x - 7, s.y - 13);
    ctx.moveTo(s.x + 7, s.y - 13);
    ctx.lineTo(s.x + 20, s.y - 13);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y - 1);
    ctx.lineTo(s.x + 2, s.y + 9);
    ctx.lineTo(s.x - 2, s.y + 10);
    ctx.stroke();

    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y + 18, 10, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  });

  return canvas.toDataURL('image/jpeg', 0.92);
}

export const SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-empty-hall',
    title: 'Empty Hall (0 Students)',
    description: 'Negative control: Empty lecture hall to verify the model does not hallucinate false heads.',
    studentCountLabel: '0 Students (Empty)',
    expectedCount: 0,
    scenarioType: 'negative',
    createDataUrl: createEmptyClassroomSample,
  },
  {
    id: 'sample-single-student',
    title: 'Individual Desk (1 Student)',
    description: 'Baseline single-person case in library setting with background books.',
    studentCountLabel: '1 Student',
    expectedCount: 1,
    scenarioType: 'baseline',
    createDataUrl: createSingleStudentSample,
  },
  {
    id: 'sample-study-group',
    title: 'Seminar Group (4 Students)',
    description: 'Small group discussion table with 4 students facing camera with whiteboard.',
    studentCountLabel: '4 Students',
    expectedCount: 4,
    scenarioType: 'small-group',
    createDataUrl: createStudyGroupSample,
  },
  {
    id: 'sample-lecture-hall',
    title: 'Classroom Lecture (8 Students)',
    description: 'Two-tier lecture room with front and rear row seating arrangements.',
    studentCountLabel: '8 Students',
    expectedCount: 8,
    scenarioType: 'lecture',
    createDataUrl: createLectureHallSample,
  },
];
