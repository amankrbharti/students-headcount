# Student's Headcount — AI-Based Head Counting System

A production-ready, client-side computer vision application designed to accurately count visible human heads in classroom and group photographs using deep learning.

---

## 1. Project Overview

**Student's Headcount** is designed specifically for academic environments: lecture halls, seminars, study groups, and auditorium events. Unlike generic person-detection models that rely on full-body torsos and legs (which frequently fail when students are seated behind desks, tables, or podiums), this system relies on the **MediaPipe Face/Head Detector (Full-Range model)**. It identifies cranial features, facial contours, and keypoints to detect seated and standing students alike.

---

## 2. Key Features

- **Genuine Pretrained Model:** Uses `@tensorflow-models/face-detection` with the MediaPipe Full-Range model architecture (detects heads up to 5 meters in depth).
- **Zero Server Upload (100% Privacy):** Neural inference executes directly on the client's device using TensorFlow.js with WebGL GPU acceleration. Student images never leave the browser.
- **Drag & Drop Upload:** Accepts **JPG, JPEG, PNG, and WEBP** images with file validation (up to 15MB).
- **Live Camera Capture:** Snap live photos from any connected webcam or mobile device camera.
- **Preset Demonstration Samples:** One-click built-in test scenes (Seminar Group, Classroom Lecture) for instant evaluation without uploading files.
- **Visual Inspector:**
  - Dynamic bounding box rendering with student number badges (`#1`, `#2`, `#3`...).
  - Zoom-in, zoom-out, and pan controls for inspecting dense back rows in high-resolution photographs.
  - Raw vs. Annotated instant comparison toggle.
  - Export annotated image as high-res PNG.
- **Interactive Sensitivity Slider:** Adjust confidence threshold from 10% to 85% to balance recall (detecting distant/small heads) vs. precision (suppressing false positives).
- **Detection Manifest Table:** Full tabular view of every detected student with ID, confidence score %, bounding box dimensions (W × H px), and coordinates (X, Y). Hovering or clicking a row highlights the box on the image canvas.
- **Attendance Export:** Export detections directly to a clean CSV file with student head IDs, confidence ratings, and bounding box coordinates for record-keeping.
- **Color Themes:** Customizable bounding box colors (Royal Blue, Emerald Green, Amber, Cyan).
- **Responsive Dashboard:** Optimized for desktop monitors, laptops, tablets, and smartphones.

---

## 3. Architecture & Code Structure

```text
/
├── index.html                           # Entry HTML with meta tags and typography
├── metadata.json                        # Applet metadata configuration
├── package.json                         # Dependencies & npm scripts
├── vite.config.ts                       # Vite bundler configuration & ESM shims
├── src/
│   ├── main.tsx                         # React 19 root bootstrap
│   ├── App.tsx                          # Primary dashboard state and layout
│   ├── index.css                        # Tailwind CSS styling and font definitions
│   ├── types/
│   │   └── index.ts                     # TypeScript interfaces (DetectedHead, ImageMetadata, etc.)
│   ├── utils/
│   │   ├── detector.ts                  # MediaPipe detector initialization & inference pipeline
│   │   ├── imageUtils.ts                # File validation, canvas drawing, PNG & CSV exporters
│   │   └── sampleImages.ts              # Preset classroom samples for zero-friction testing
│   ├── shims/
│   │   └── mediapipe-face-detection.ts  # ESM shim for Vite compatibility
│   └── components/
│       ├── Navbar.tsx                   # Top navigation with live model status indicator
│       ├── UploadArea.tsx               # Drag & drop, file browse, live camera, and preset samples
│       ├── AnnotatedCanvas.tsx          # High-performance canvas with pan/zoom and overlays
│       ├── StatsPanel.tsx               # Headcount KPI, sensitivity slider, and display toggles
│       ├── DetectionTable.tsx           # Searchable, sortable manifest of detected students
│       └── DocumentationModal.tsx       # Embedded guide with limitations & testing protocols
```

---

## 4. How the Head Detection Model Works

1. **Model Architecture:** The detector is based on the MediaPipe BlazeFace / Full-Range detector architecture. It employs custom feature extraction with an anchor grid optimized for frontal, profile, and slightly tilted heads.
2. **Receptive Field:** The `full` model configuration is chosen because it features an expanded receptive field tailored for heads at distances up to 5 meters, which is essential for lecture halls.
3. **Non-Maximum Suppression (NMS):** When the model generates overlapping candidate proposals for the same head, NMS calculates Intersection-over-Union (IoU) and suppresses duplicates to prevent double-counting.
4. **Coordinate Sorting:** Detected heads are sorted row-by-row (top-to-bottom, left-to-right) so that assigned student IDs (`#1`, `#2`, `#3`...) follow the natural seating arrangement in the room.

---

## 5. System Limitations

- **Back-Facing Individuals:** Students facing completely away from the camera (180°) lack visible facial landmarks and may not be picked up by the detector.
- **Severe Occlusion:** Heads partially hidden behind tall monitors, podiums, or taller students sitting directly in front.
- **Extreme Distance / Low Resolution:** In auditoriums with 100+ seats, heads in back rows that occupy fewer than 20×20 pixels may fall below the model's minimum feature threshold. Utilizing high-resolution photos (1080p, 2K, or 4K) significantly improves back-row recall.
- **Lighting Extremes:** Heavy lens flare or extreme shadows across faces may cause detection misses.

---

## 6. How to Run the Application

### Prerequisites
- Node.js (version 18 or newer)
- npm or yarn

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

To build for production:
```bash
npm run build
```

---

## 7. Manual Testing Checklist

| Test Scenario | Group / Crowd Size | Recommended Sensitivity | Expected Result |
| :--- | :--- | :--- | :--- |
| **Preset 1: Seminar Group** | 4 Students | 35% – 50% | Exactly 4 heads detected with clean boxes and sequential IDs #1 to #4. |
| **Preset 2: Lecture Hall** | 8 Students | 30% – 40% | Front and back row heads detected and ordered logically. |
| **Live Camera Snapshot** | 1–3 People | 35% – 45% | Instant detection of users facing the camera in real time. |
| **High Sensitivity Test** | Any Group Photo | Set to 15% – 20% | Detects smaller or faint heads; may introduce borderline boxes. |
| **High Precision Test** | Any Group Photo | Set to 60% – 80% | Only detects high-confidence, fully visible frontal heads. |
| **File Format Validation** | PDF / Unsupported file | N/A | Application displays an error banner: "Unsupported file format". |
| **File Size Limit Check** | File &gt; 15 MB | N/A | Application shows a validation error: "File is too large". |
| **CSV Attendance Export** | Populated Manifest | Any | Downloads `headcount_report_<timestamp>.csv` with coordinates and scores. |
| **PNG Image Export** | Annotated Canvas | Any | Downloads high-resolution annotated image matching screen visualization. |

---

## 8. How to Test Counting Accuracy Manually

1. **Visual Cross-Check:** Look at the sequential badges (`#1`, `#2`, `#3`...) on the image canvas. Count through the numbered badges in order.
2. **Use the "Raw / Annotated" Toggle:** Click the `Raw` button on the canvas toolbar to remove all bounding boxes and observe the original photo, then toggle back to check if any student was missed.
3. **Use the Zoom Tool:** For crowded back rows, click the `+` zoom button (or scroll) and drag to pan across the rows to confirm small heads.
4. **Check the Manifest Table:** Click any row in the manifest table to focus that student's bounding box on the image canvas.
