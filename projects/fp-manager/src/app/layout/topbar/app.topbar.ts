import { Component, inject } from '@angular/core';
import { LayoutService } from '../layout.service';
import { NgClass } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [NgClass, StyleClassModule],
  templateUrl: './app.topbar.html',
})
export class AppTopbar {
  protected layoutService = inject(LayoutService);

  toggleDarkMode() {
    this.layoutService.toggleDarkMode();
  }
}
