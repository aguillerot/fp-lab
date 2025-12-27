import { Component, computed, inject } from '@angular/core';
import { AppTopbar } from './topbar/app.topbar';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { LayoutService } from './layout.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [AppTopbar, RouterOutlet, NgClass],
  templateUrl: './app.layout.html',
})
export class AppLayout {
  protected layoutService = inject(LayoutService);

  readonly containerClass = computed(() => {
    const menuMode = this.layoutService.menuMode();
    const overlayMenuActive = this.layoutService.overlayMenuActive();
    const staticMenuDesktopInactive = this.layoutService.staticMenuDesktopInactive();
    const staticMenuMobileActive = this.layoutService.staticMenuMobileActive();
    return {
      'layout-overlay': menuMode === 'overlay',
      'layout-static': menuMode === 'static',
      'layout-static-inactive': staticMenuDesktopInactive && menuMode === 'static',
      'layout-overlay-active': overlayMenuActive,
      'layout-mobile-active': staticMenuMobileActive,
    };
  });
}
