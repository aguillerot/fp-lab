import { Component, computed, ElementRef, input, viewChild } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

@Component({
  selector: 'app-white-balance-grid',
  templateUrl: './white-balance-grid.component.html',
  styleUrl: './white-balance-grid.component.scss',
  standalone: true,
})
export class WhiteBalanceGridComponent {
  readonly ba = input.required<FieldTree<number, string>>();
  readonly mg = input.required<FieldTree<number, string>>();

  readonly container = viewChild.required<ElementRef<HTMLElement>>('container');

  protected readonly x = computed(() => {
    return this.ba()().value();
  });

  protected readonly y = computed(() => {
    return this.mg()().value();
  });

  protected readonly pointerStyle = computed(() => {
    const ba = this.x();
    const mg = this.y();

    // Map -16..16 to 0..100%
    const left = ((ba + 16) / 32) * 100;
    const bottom = ((mg + 16) / 32) * 100;

    return {
      left: `${left}%`,
      bottom: `${bottom}%`,
    };
  });

  protected readonly gValue = computed(() => Math.max(0, this.y()));
  protected readonly mValue = computed(() => Math.max(0, -this.y()));
  protected readonly bValue = computed(() => Math.max(0, -this.x()));
  protected readonly aValue = computed(() => Math.max(0, this.x()));

  onMouseDown(event: MouseEvent) {
    event.preventDefault();
    // Focus the container to enable keyboard navigation
    this.container().nativeElement.focus();
    this.updateFromEvent(event);

    const moveHandler = (e: MouseEvent) => {
      e.preventDefault();
      this.updateFromEvent(e);
    };
    const upHandler = () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  }

  onKeyDown(event: KeyboardEvent) {
    let ba = this.x();
    let mg = this.y();
    let changed = false;

    switch (event.key) {
      case 'ArrowUp':
        mg = Math.min(16, mg + 2);
        changed = true;
        break;
      case 'ArrowDown':
        mg = Math.max(-16, mg - 2);
        changed = true;
        break;
      case 'ArrowLeft':
        ba = Math.max(-16, ba - 2);
        changed = true;
        break;
      case 'ArrowRight':
        ba = Math.min(16, ba + 2);
        changed = true;
        break;
    }

    if (changed) {
      event.preventDefault();
      // Update fields using the same pattern as updateFromEvent
      this.mg()().value.set(mg);
      this.ba()().value.set(ba);
    }
  }

  private updateFromEvent(event: MouseEvent) {
    const rect = this.container().nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = rect.bottom - event.clientY; // Y from bottom

    // Clamp
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const clampedY = Math.max(0, Math.min(y, rect.height));

    // Map to -16..16
    // 0 -> -16
    // width -> 16
    let ba = (clampedX / rect.width) * 32 - 16;
    let mg = (clampedY / rect.height) * 32 - 16;

    // Round to step 2
    ba = Math.round(ba / 2) * 2;
    mg = Math.round(mg / 2) * 2;

    // Update fields
    this.mg()().value.set(mg);
    this.ba()().value.set(ba);
  }
}
