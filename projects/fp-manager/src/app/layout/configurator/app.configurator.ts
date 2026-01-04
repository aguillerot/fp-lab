import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { $t, updatePreset, updateSurfacePalette } from '@primeuix/themes';
import { isNil } from 'fp-shared/utils';
import { PrimeNG } from 'primeng/config';
import { SelectButton } from 'primeng/selectbutton';
import { LayoutService } from '../layout.service';
import { colors, menuModeOptions, presets, surfaces } from './configurator.constants';
import { KeyOfType, SurfacesType } from './configurator.model';

@Component({
  selector: 'app-configurator',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectButton],
  templateUrl: './app.configurator.html',
  host: {
    class:
      'hidden absolute top-13 right-0 w-72 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]',
  },
})
export class AppConfigurator implements OnInit {
  protected readonly router = inject(Router);

  protected readonly config: PrimeNG = inject(PrimeNG);

  protected readonly layoutService = inject(LayoutService);

  protected readonly platformId = inject(PLATFORM_ID);

  protected readonly primeng = inject(PrimeNG);

  protected readonly presets = Object.keys(presets);

  protected readonly showMenuModeButton = signal(!this.router.url.includes('auth'));

  protected readonly menuModeOptions = menuModeOptions;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.onPresetChange(this.layoutService.preset());
    }
  }

  protected readonly surfaces = surfaces;

  primaryColors = computed<SurfacesType[]>(() => {
    const presetPalette = presets[this.layoutService.preset()].primitive;
    if (isNil(presetPalette)) {
      return [];
    }

    const palettes: SurfacesType[] = [{ name: 'noir', palette: {} }];

    colors.forEach(color => {
      palettes.push({
        name: color,
        palette: presetPalette[color] as SurfacesType['palette'],
      });
    });

    return palettes;
  });

  getPresetExt() {
    const color: SurfacesType = this.primaryColors().find(c => c.name === this.layoutService.primary()) || {};
    const preset = this.layoutService.preset();

    if (color.name === 'noir') {
      return {
        semantic: {
          primary: {
            50: '{surface.50}',
            100: '{surface.100}',
            200: '{surface.200}',
            300: '{surface.300}',
            400: '{surface.400}',
            500: '{surface.500}',
            600: '{surface.600}',
            700: '{surface.700}',
            800: '{surface.800}',
            900: '{surface.900}',
            950: '{surface.950}',
          },
          colorScheme: {
            light: {
              primary: {
                color: '{primary.950}',
                contrastColor: '#ffffff',
                hoverColor: '{primary.800}',
                activeColor: '{primary.700}',
              },
              highlight: {
                background: '{primary.950}',
                focusBackground: '{primary.700}',
                color: '#ffffff',
                focusColor: '#ffffff',
              },
            },
            dark: {
              primary: {
                color: '{primary.50}',
                contrastColor: '{primary.950}',
                hoverColor: '{primary.200}',
                activeColor: '{primary.300}',
              },
              highlight: {
                background: '{primary.50}',
                focusBackground: '{primary.300}',
                color: '{primary.950}',
                focusColor: '{primary.950}',
              },
            },
          },
        },
      };
    } else {
      if (preset === 'Nora') {
        return {
          semantic: {
            primary: color.palette,
            colorScheme: {
              light: {
                primary: {
                  color: '{primary.600}',
                  contrastColor: '#ffffff',
                  hoverColor: '{primary.700}',
                  activeColor: '{primary.800}',
                },
                highlight: {
                  background: '{primary.600}',
                  focusBackground: '{primary.700}',
                  color: '#ffffff',
                  focusColor: '#ffffff',
                },
              },
              dark: {
                primary: {
                  color: '{primary.500}',
                  contrastColor: '{surface.900}',
                  hoverColor: '{primary.400}',
                  activeColor: '{primary.300}',
                },
                highlight: {
                  background: '{primary.500}',
                  focusBackground: '{primary.400}',
                  color: '{surface.900}',
                  focusColor: '{surface.900}',
                },
              },
            },
          },
        };
      } else {
        return {
          semantic: {
            primary: color.palette,
            colorScheme: {
              light: {
                primary: {
                  color: '{primary.500}',
                  contrastColor: '#ffffff',
                  hoverColor: '{primary.600}',
                  activeColor: '{primary.700}',
                },
                highlight: {
                  background: '{primary.50}',
                  focusBackground: '{primary.100}',
                  color: '{primary.700}',
                  focusColor: '{primary.800}',
                },
              },
              dark: {
                primary: {
                  color: '{primary.400}',
                  contrastColor: '{surface.900}',
                  hoverColor: '{primary.300}',
                  activeColor: '{primary.200}',
                },
                highlight: {
                  background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                  focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                  color: 'rgba(255,255,255,.87)',
                  focusColor: 'rgba(255,255,255,.87)',
                },
              },
            },
          },
        };
      }
    }
  }

  updateColors(event: Event, type: string, color: SurfacesType) {
    if (type === 'primary') {
      this.layoutService.updatePrimary(color.name!);
    } else if (type === 'surface') {
      this.layoutService.updateSurface(color.name);
    }
    this.applyTheme(type, color);

    event.stopPropagation();
  }

  applyTheme(type: string, color: SurfacesType) {
    if (type === 'primary') {
      updatePreset(this.getPresetExt());
    } else if (type === 'surface') {
      updateSurfacePalette(color.palette);
    }
  }

  onPresetChange(newPreset: KeyOfType<typeof presets>) {
    this.layoutService.updatePreset(newPreset);
    const preset = presets[newPreset];
    const surfacePalette = this.surfaces.find(s => s.name === this.layoutService.surface())?.palette;
    $t().preset(preset).preset(this.getPresetExt()).surfacePalette(surfacePalette).use({ useDefaultOptions: true });
  }

  onMenuModeChange(newMenuMode: string) {
    this.layoutService.updateMenuMode(newMenuMode);
  }
}
