import {
  Component,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { KeyboardShortcuts } from '../../../services/keyboard-shortcuts';
import { ShortcutEntry, ShortcutGroup } from './shortcuts-overlay.model';

/**
 * Keyboard-shortcut overlay (official parity): centered dark modal listing
 * the app's real key bindings as keycap chips, grouped by concern; opened
 * with ?/Shift+/ via KeyboardShortcuts and closed with Escape or a
 * backdrop click. While open, playback shortcuts are suspended by design
 * (the service yields) — the overlay content is the display source of
 * truth for what actually works.
 */
@Component({
  selector: 'app-shortcuts-overlay',
  imports: [],
  templateUrl: './shortcuts-overlay.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './shortcuts-overlay.scss',
})
export class ShortcutsOverlay {
  // * Services
  /** Trigger (helpOpen signal) + the mapped key bindings (helpers) */
  private readonly _keyboardShortcuts = inject(KeyboardShortcuts);

  // * Computed
  /** True when the modal is on screen */
  readonly open = computed(() => this._keyboardShortcuts.helpOpen());

  /** Closes on backdrop click (single open-state owner: the service) */
  closeOverlay() {
    this._keyboardShortcuts.closeOverlay();
  }

  //#region Content (single display source of truth for real bindings)
  /** Overlay content, mirroring the KeyboardShortcuts service map */
  readonly groups: ShortcutGroup[] = [
    {
      heading: 'Playback',
      entries: [
        { description: 'Play / pause', keys: ['Space'] },
        { description: 'Next track', keys: ['N'] },
        { description: 'Previous track', keys: ['P'] },
      ],
    },
    {
      heading: 'Seek & volume',
      entries: [
        { description: 'Seek 5 s forward', keys: ['→'] },
        { description: 'Seek 5 s backward', keys: ['←'] },
        { description: 'Raise volume', keys: ['↑'] },
        { description: 'Lower volume', keys: ['↓'] },
        { description: 'Mute / unmute', keys: ['M'] },
      ],
    },
    {
      heading: 'Modes',
      entries: [
        { description: 'Toggle shuffle', keys: ['S'] },
        { description: 'Cycle repeat off / all / one', keys: ['R'] },
      ],
    },
    {
      heading: 'Overlay',
      entries: [
        { description: 'Show this help', keys: ['?'] },
        { description: 'Close overlay', keys: ['Esc'] },
      ],
    },
  ];
  //#endregion
}
