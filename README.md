# Student's Headcount — AI-Based Classroom Vision System

An AI-based computer vision web application that detects visible heads in classroom or group images and displays the estimated headcount with visual detection results.

🔗 **Live Demo:** https://students-headcount-mocha.vercel.app  
💻 **GitHub Repository:** https://github.com/amankrbharti/students-headcount

## 📌 Project Overview

Student's Headcount aims to make headcount estimation easier by detecting visible heads in an uploaded image or a camera capture. The application displays detected regions using bounding boxes and provides details about individual detections.

This project was developed as a college mini-project for Computer Science and Engineering.

## ✨ Features

- **Image Upload:** Upload JPG, JPEG, PNG, and WEBP images.
- **Live Camera:** Capture an image using a supported camera.
- **Automatic Headcount:** Display the number of detected heads.
- **Bounding Boxes:** Visually mark detected heads on the image.
- **Detection Details:** View detection IDs, confidence scores, and bounding-box information.
- **Image Preview:** Inspect the detection results.
- **PNG Export:** Download the annotated image.
- **Responsive Interface:** Use the application on supported desktop and mobile browsers.

## 🛠️ Technology Stack

- **React** — User interface
- **TypeScript** — Type-safe application code
- **Vite** — Development server and build tool
- **Tailwind CSS** — Styling
- **TensorFlow.js** — Browser-based machine-learning support
- **Face Detection Model Package** — `@tensorflow-models/face-detection`
- **GitHub** — Source-code hosting and version control
- **Vercel** — Deployment and hosting

## ⚙️ How It Works

1. Open the application.
2. Upload a supported image or capture one using the camera.
3. The detection system processes the image.
4. Detected heads are marked with bounding boxes.
5. The application displays the estimated headcount and detection details.
6. Download the annotated image if required.

## 🚀 Run the Project Locally

### Prerequisites

- Node.js installed
- npm installed
- Git installed (recommended)

### Installation

Clone the repository:

```bash
git clone https://github.com/amankrbharti/students-headcount.git
```

Open the project folder:

```bash
cd students-headcount
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal. The project's development server is configured to use port `3000`.

### Production Build

To create a production build, run:

```bash
npm run build
```

## 🧪 Testing

The application was tested with a sample image containing four visible people. In that test, it displayed four detections with corresponding bounding boxes.

This is a sample test result, not a formal measurement of overall model accuracy. Results may vary depending on image quality, lighting, distance, and overlapping or partially hidden heads.

## ⚠️ Limitations

- Some heads may be missed in crowded or low-resolution images.
- Overlapping or partially hidden heads can affect the count.
- Poor lighting, camera angles, and image blur may reduce detection quality.
- The estimated headcount should be checked before using it for important decisions.

## 🔮 Future Improvements

- Improve detection performance in crowded classrooms.
- Add video-based continuous headcount estimation.
- Expand testing across different lighting and camera conditions.
- Add downloadable reports and additional analysis features.

## 👨‍💻 Project Team

**Institution:** Dr. Ambedkar Institute of Technology for Divyangjan, Kanpur  
**Branch:** Computer Science and Engineering  
**Academic Session:** 2026–2027

| Team Member | Roll Number |
|---|---:|
| Aman Kumar Bharti | 10 |
| Amit Kateriya | 11 |
| Ashutosh Verma | 38 |
| Divyanshu Sonkar | 59 |

**Project Guide:** Add your guide's name here.

## 📄 Disclaimer

This project estimates visible headcount from images. It does not identify individual students and should not be treated as a guaranteed attendance record or as a system with 100% detection accuracy.

---

**Made for academic learning and demonstration.**
