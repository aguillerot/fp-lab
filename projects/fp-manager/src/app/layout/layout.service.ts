import { computed, effect } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap } from 'rxjs';
import { presets } from './configurator/configurator.constants';
import { KeyOfType } from './configurator/configurator.model';

const STORAGE_KEY = 'fp-manager-layout';

type PersistedLayoutState = {
  preset: KeyOfType<typeof presets>;
  primary: string;
  surface: string | undefined | null;
  isDarkTheme: boolean;
  menuMode: string;
};

type LayoutState = PersistedLayoutState & {
  staticMenuDesktopInactive: boolean;
  overlayMenuActive: boolean;
  configSidebarVisible: boolean;
  staticMenuMobileActive: boolean;
  menuHoverActive: boolean;
  _initialized: boolean;
  _transitionComplete: boolean;
};

const defaultPersistedState = (): PersistedLayoutState => ({
  preset: 'Aura',
  primary: 'emerald',
  surface: null,
  isDarkTheme: false,
  menuMode: 'static',
});

const loadPersistedState = (): PersistedLayoutState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultPersistedState(), ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parsing errors
  }
  return defaultPersistedState();
};

const defaultState = (): LayoutState => ({
  ...loadPersistedState(),
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
    const persistState = (): void => {
      const stateToPersist: PersistedLayoutState = {
        preset: store.preset(),
        primary: store.primary(),
        surface: store.surface(),
        isDarkTheme: store.isDarkTheme(),
        menuMode: store.menuMode(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
    };
    return {
      onInit: () => {
        handleDarkModeTransition(store.isDarkTheme);
        effect(() => {
          // Track all persisted properties
          store.preset();
          store.primary();
          store.surface();
          store.isDarkTheme();
          store.menuMode();
          persistState();
        });
      },
    };
  }),
);
