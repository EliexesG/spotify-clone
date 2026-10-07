import {
  Component,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReproductionController } from '../../reproduction/reproduction-controller/reproduction-controller';
import { PlaylistPlayer } from '../../../services/playlist-player';
import { CrudPlaylist } from '../../../services/crud-playlist';
import { LibrarySection } from '../library-section/library-section';
import { NowPlayingSection } from '../now-playing-section/now-playing-section';
import { TopBar } from '../top-bar/top-bar';
import { PlaybackFeedback } from '../../ui/playback-feedback/playback-feedback';
import { ShortcutsOverlay } from '../../ui/shortcuts-overlay/shortcuts-overlay';
import { KeyboardShortcuts } from '../../../services/keyboard-shortcuts';

/**
 * Window width at which both side panels (library 320 + now playing 320 +
 * center 400 + gaps) fit without shrinking the center — derived from the
 * official web player's measured pane widths; below it, exactly one of the
 * two panels is open.
 */
const BOTH_FIT_WIDTH = 1080;

/**
 * Application shell: composes the non-routed panels (top bar, library
 * sidebar, now-playing section, transport bar) and hosts the routed center
 * view via the router outlet. Preloads the default playlist at bootstrap,
 * activates the global keyboard shortcuts, and owns the panel-space
 * arbitration (official behavior: the center never shrinks; side panels
 * swap — opening one collapses the other when width is insufficient, and
 * the library auto-collapses to its icon rail when the window narrows).
 * The panels own their collapsed presentations (rail/sliver) and open
 * state is two-way bound.
 */
@Component({
  selector: 'app-scaffold',
  imports: [
    RouterOutlet,
    ReproductionController,
    LibrarySection,
    NowPlayingSection,
    TopBar,
    PlaybackFeedback,
    ShortcutsOverlay,
  ],
  templateUrl: './scaffold.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './scaffold.scss',
})
export class Scaffold {
  // * Services
  /** Preloads the default playlist at bootstrap */
  private readonly _crudPlaylist = inject(CrudPlaylist);
  /** Queue owner (default playlist hand-off) */
  private readonly _playlistPlayer = inject(PlaylistPlayer);
  /** Global playback shortcuts (instantiated once here; root service) */
  private readonly _keyboardShortcuts = inject(KeyboardShortcuts);

  //#region Panel state (space arbitration)
  /** Whether the library panel is open (false = icon rail) */
  libraryOpen = signal(true);
  /** Whether the now-playing panel is open (false = sliver) */
  nowPlayingOpen = signal(true);

  /** Live viewport width (drives the arbitration threshold) */
  width = signal(typeof window !== 'undefined' ? window.innerWidth : 1440);

  /** Whether both panels fit side by side at the current width */
  bothFit = computed(() => this.width() >= BOTH_FIT_WIDTH);

  constructor() {
    const defaultPlaylist = this._crudPlaylist.getDefaultPlaylist();

    if (defaultPlaylist)
      this._playlistPlayer.changePlaylistSource(defaultPlaylist);

    // * Narrowing below both-fit with both panels open: the library loses
    // * (auto-collapses to rail) and now playing stays open — official order
    effect(() => {
      if (!this.bothFit() && this.libraryOpen() && this.nowPlayingOpen())
        this.libraryOpen.set(false);
    });
  }

  /** Tracks viewport resizes for the arbitration thresholds */
  @HostListener('window:resize')
  onResize() {
    this.width.set(window.innerWidth);
  }

  /**
   * Library open request (two-way from the panel's header).
   *
   * Opening the library below the threshold closes now playing (keeping
   * exactly one panel open).
   *
   * @param open - The library's requested open state.
   */
  setLibraryOpen(open: boolean) {
    this.libraryOpen.set(open);

    if (open && !this.bothFit()) this.nowPlayingOpen.set(false);
  }

  /**
   * Now-playing open request (two-way from the panel's X/sliver).
   *
   * Opening the panel below the threshold closes the library to its rail
   * (keeping exactly one panel open).
   *
   * @param open - The now-playing panel's requested state.
   */
  setNowPlayingOpen(open: boolean) {
    this.nowPlayingOpen.set(open);

    if (open && !this.bothFit()) this.libraryOpen.set(false);
  }
  //#endregion
}
