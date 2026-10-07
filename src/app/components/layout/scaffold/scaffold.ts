import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
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
 * Application shell: composes the non-routed panels (top bar, library
 * sidebar, now-playing section, transport bar) and hosts the routed center
 * view via the router outlet. Preloads the default playlist at bootstrap
 * and activates the global keyboard shortcuts.
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

  constructor() {
    const defaultPlaylist = this._crudPlaylist.getDefaultPlaylist();

    if (defaultPlaylist)
      this._playlistPlayer.changePlaylistSource(defaultPlaylist);
  }
}
