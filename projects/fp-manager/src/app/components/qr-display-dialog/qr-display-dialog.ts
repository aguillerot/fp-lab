import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { CameraProtocolService } from 'fp-shared/services';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import QRCode from 'qrcode';

@Component({
  selector: 'app-qr-display-dialog',
  standalone: true,
  imports: [Dialog, ProgressSpinner],
  templateUrl: './qr-display-dialog.html',
  styleUrl: './qr-display-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrDisplayDialog {
  protected protocolService = inject(CameraProtocolService);
  public readonly qrCodeData = input<number[] | null>(null);

  public readonly visible = model<boolean>(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('qrCanvas');

  protected readonly hasData = computed(() => {
    const data = this.qrCodeData();
    return data !== null && data.length > 0;
  });

  protected readonly title = computed(() => {
    const data = this.qrCodeData();
    return data ? this.protocolService.decode(new Uint8Array(data)).shootingModeName : 'QR Code';
  });

  constructor() {
    effect(() => {
      const canvas = this.canvasRef();
      const data = this.qrCodeData();
      const isVisible = this.visible();

      if (isVisible && canvas && data && data.length > 0) {
        this.generateQrCode(data, canvas.nativeElement);
      }
    });
  }

  private async generateQrCode(data: number[], canvas: HTMLCanvasElement): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const uint8Array = new Uint8Array(data);

      await QRCode.toCanvas(canvas, [{ data: uint8Array, mode: 'byte' }], {
        width: 300,
        margin: 2,
        version: 20,
        errorCorrectionLevel: 'L',
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      this.errorMessage.set('Failed to generate QR code');
    } finally {
      this.isLoading.set(false);
    }
  }
}
