import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap } from 'rxjs';
import { presets } from './configurator/configurator.constants';
import { KeyOfType } from './configurator/configurator.model';

type LayoutState = {
  preset: KeyOfType<typeof presets>;
  primary: string;
  surface: string | undefined | null;
  isDarkTheme: boolean;
  menuMode: string;
  staticMenuDesktopInactive: boolean;
  overlayMenuActive: boolean;
  configSidebarVisible: boolean;
  staticMenuMobileActive: boolean;
  menuHoverActive: boolean;
  _initialized: boolean;
  _transitionComplete: boolean;
};

const defaultState = (): LayoutState => ({
  preset: 'Aura',
  primary: 'emerald',
  surface: null,
  isDarkTheme: false,
  menuMode: 'static',
  staticMenuDesktopInactive: false,
  overlayMenuActive: false,
  configSidebarVisible: false,
  staticMenuMobileActive: false,
  menuHoverActive: false,
  _initialized: false,
  _transitionComplete: false,
});

export const LayoutService = signalStore(
  { providedIn: 'root' },
  withState<LayoutState>(defaultState()),
  withComputed(store => ({
    isSidebarActive: computed(() => store.overlayMenuActive || store.staticMenuMobileActive),
    theme: computed(() => (store.isDarkTheme() ? 'dark' : 'light')),
    isOverlay: computed(() => store.menuMode() === 'overlay'),
  })),
  withMethods(store => {
    const isDesktop = (): boolean => window.innerWidth > 991;
    return {
      updatePrimary: (primary: string) => {
        patchState(store, () => ({
          primary,
        }));
      },
      updateSurface: (surface: string | undefined | null) => {
        patchState(store, () => ({
          surface,
        }));
      },
      updatePreset: (preset: KeyOfType<typeof presets>) => {
        patchState(store, () => ({
          preset,
        }));
      },
      updateMenuMode: (menuMode: string) => {
        patchState(store, () => ({
          menuMode,
        }));
      },
      toggleDarkMode: () => {
        patchState(store, ({ isDarkTheme }) => ({
          isDarkTheme: !isDarkTheme,
        }));
      },
      toggleMenu: () => {
        if (store.isOverlay()) {
          patchState(store, ({ overlayMenuActive }) => ({
            overlayMenuActive: !overlayMenuActive,
          }));
        }

        if (isDesktop()) {
          patchState(store, ({ staticMenuDesktopInactive }) => ({
            staticMenuDesktopInactive: !staticMenuDesktopInactive,
          }));
        } else {
          patchState(store, ({ staticMenuMobileActive }) => ({
            staticMenuMobileActive: !staticMenuMobileActive,
          }));
        }
      },
    };
  }),
  withHooks(store => {
    const toggleClass = (isDarkTheme?: boolean): void => {
      const _isDarkTheme = isDarkTheme === undefined ? store.isDarkTheme() : isDarkTheme;
      if (_isDarkTheme) {
        document.documentElement.classList.add('app-dark');
      } else {
        document.documentElement.classList.remove('app-dark');
      }
    };
    const onTransitionEnd = (): void => {
      patchState(store, { _transitionComplete: true });
      setTimeout(() => {
        patchState(store, { _transitionComplete: false });
      });
    };
    const startViewTransition = (isDarkTheme: boolean): void => {
      const transition = document.startViewTransition(() => {
        toggleClass(isDarkTheme);
      });

      transition.ready
        .then(() => {
          onTransitionEnd();
        })
        .catch(() => {
          // Empty
        });
    };
    const handleDarkModeTransition = rxMethod<boolean>(
      tap(isDarkTheme => {
        startViewTransition(isDarkTheme);
      }),
    );
    return {
      onInit: () => {
        handleDarkModeTransition(store.isDarkTheme);
      },
    };
  }),
);
