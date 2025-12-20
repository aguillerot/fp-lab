import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrScanner } from './qr-scanner';

describe('QrScanner', () => {
  let component: QrScanner;
  let fixture: ComponentFixture<QrScanner>;

  beforeEach(async () => {
    // Mock navigator.mediaDevices for the test environment
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [],
        }),
      },
      writable: true,
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [QrScanner],
    }).compileComponents();

    fixture = TestBed.createComponent(QrScanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
