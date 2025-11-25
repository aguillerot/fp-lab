import { Component, effect, ElementRef, input, OnDestroy, output, viewChild } from '@angular/core';
import jsQR from 'jsqr';

@Component({
  selector: 'lib-qr-scanner',
  imports: [],
  templateUrl: './qr-scanner.html',
  styleUrl: './qr-scanner.scss',
})
export class QrScanner implements OnDestroy {
  deviceId = input<string>();
  qrCodeScanned = output<ArrayBuffer>();
  scanCancelled = output<void>();
  scanError = output<string>();

  videoElement = viewChild.required<ElementRef<HTMLVideoElement>>('videoElement');
  canvasElement = viewChild.required<ElementRef<HTMLCanvasElement>>('canvasElement');

  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;

  constructor() {
    effect(() => {
      this.stopStream(); // Stop any existing stream
      this.startStream(this.deviceId()); // Start a new one when deviceId changes
    });
  }

  async startStream(deviceId: string | undefined) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: 'environment',
        },
      });
      const video = this.videoElement().nativeElement;
      video.srcObject = this.stream;
      // Wait for the video to start playing to get its dimensions
      video.onloadedmetadata = () => {
        this.scanFrame();
      };
    } catch (err) {
      console.error('Error accessing camera:', err);
      this.scanError.emit('Could not access the camera. Please check permissions.');
    }
  }

  stopStream() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  scanFrame() {
    const video = this.videoElement().nativeElement;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = this.canvasElement().nativeElement;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.binaryData.length > 0) {
          // jsQR gives us binaryData as number[], convert it to Uint8Array's buffer.
          const byteArray = new Uint8Array(code.binaryData);
          this.qrCodeScanned.emit(byteArray.buffer);
          this.stopStream();
          return; // Exit the loop
        }
      }
    }
    // Continue scanning the next frame
    this.animationFrameId = requestAnimationFrame(() => this.scanFrame());
  }

  cancel() {
    this.scanCancelled.emit();
    this.stopStream(); // Also stop the stream on manual cancel
  }

  ngOnDestroy() {
    this.stopStream();
  }
}
