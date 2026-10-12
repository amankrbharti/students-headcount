/**
 * Shim for @mediapipe/face_detection for Vite ESM bundler compatibility.
 * When using @tensorflow-models/face-detection with runtime: 'tfjs',
 * TensorFlow.js executes the models directly and does not invoke the C++ wasm MediaPipe runtime.
 */
export class FaceDetection {
  constructor(_options?: unknown) {
    // Standard class instance
  }
  setOptions(): void {}
  onResults(): void {}
  async send(): Promise<void> {}
  async close(): Promise<void> {}
  reset(): void {}
  async initialize(): Promise<void> {}
}

export const VERSION = '0.4.1646425229';

export default {
  FaceDetection,
  VERSION,
};
