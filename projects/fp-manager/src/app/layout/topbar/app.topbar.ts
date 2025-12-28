import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from '../configurator/app.configurator';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [NgClass, StyleClassModule, AppConfigurator],
  templateUrl: './app.topbar.html',
})
export class AppTopbar {
  protected layoutService = inject(LayoutService);

  toggleDarkMode() {
    this.layoutService.toggleDarkMode();
  }
}
