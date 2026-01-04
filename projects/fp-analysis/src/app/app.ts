import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Field, form, required } from '@angular/forms/signals';
import { ScanDialog } from 'fp-shared/components';
import { BytesToHexPipe, HexAtIndexesPipe } from 'fp-shared/pipes';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { QrAnalysisService } from './services/qr-analysis.service';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    HexAtIndexesPipe,
    BytesToHexPipe,
    Toast,
    Card,
    Button,
    InputText,
    TableModule,
    IftaLabel,
    Dialog,
    Message,
    ScanDialog,
    Field,
  ],
  providers: [MessageService],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private analysisService = inject(QrAnalysisService);
  private messageService = inject(MessageService);

  protected settingsForm = form(signal({ parameterName: '', valueName: '' }), schemaPath => {
    required(schemaPath.parameterName, { message: 'Parameter name is required' });
    required(schemaPath.valueName, { message: 'Value name is required' });
  });

  isScanning = signal(false);
  errorMessage = signal<string | null>(null);

  readonly scanSets = this.analysisService.scanSets;

  // Dialog state
  rawDataDialogVisible = signal(false);
  selectedRawData = signal<Uint8Array | null>(null);

  showRawData(byteData: Uint8Array) {
    this.selectedRawData.set(byteData);
    this.rawDataDialogVisible.set(true);
  }

  startScan() {
    this.errorMessage.set(null);
    if (this.settingsForm().valid()) {
      this.isScanning.set(true);
    } else {
      this.errorMessage.set('Please provide both a parameter name and a value name before scanning.');
    }
  }

  onQrCodeScanned(qrData: ArrayBuffer) {
    this.isScanning.set(false);
    const { parameterName, valueName } = this.settingsForm().value();
    this.analysisService.addScan(parameterName.trim(), valueName.trim(), qrData);
    // Clear value for next scan
    this.settingsForm.valueName().value.set('');
  }

  cancelScan() {
    this.isScanning.set(false);
  }

  handleScanError(errorMsg: string) {
    this.errorMessage.set(errorMsg);
    this.isScanning.set(false);
  }

  resetParameter(paramToReset: string) {
    if (paramToReset) {
      this.analysisService.resetParameter(paramToReset);
      this.messageService.add({
        severity: 'info',
        summary: 'Reset',
        detail: `Data for '${paramToReset}' has been reset`,
      });
    }
  }
}
