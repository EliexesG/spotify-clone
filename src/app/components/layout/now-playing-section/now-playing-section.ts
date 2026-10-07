import {
  Component,
  computed,
  inject,
  model,
  ChangeDetectionStrategy,
} from '@angular/core';
import { PlaylistPlayer } from '../../../services/playlist-player';
import { MusicPlayer } from '../../../services/music-player';
import { ImageFallback } from '../../ui/image-fallback/image-fallback';
import { SourceCard } from '../../ui/source-card/source-card';

/**
 * Right shell panel: mirrors the loaded playlist and current track —
 * playlist name as panel header, large current-track cover with
 * image-fallback, title/artist, and a "Next in queue" row built on
 * SourceCard (hidden under shuffle/at queue end, matching the official
 * compact preview); empty state when nothing loads. Composed by the
 * Scaffold, which also arbitrates panel space — the open/closed state is
 * driven through a two-way model so the shell can force it shut on narrow
 * windows; closed renders as a sliver with a reopen chevron (official
 * small reference).
 */
@Component({
  selector: 'app-now-playing-section',
  imports: [ImageFallback, SourceCard],
  templateUrl: './now-playing-section.html',
  styleUrl: './now-playing-section.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class NowPlayingSection {
  // * Services
  private readonly _playlistPlayer = inject(PlaylistPlayer);
  private readonly _musicPlayer = inject(MusicPlayer);

  // * State
  /**
   * Whether the panel is open (false = collapsed sliver with reopen
   * chevron) — two-way: the shell (Scaffold) can force it to the sliver
   * when space runs out (same contract as LibrarySection.open)
   */
  open = model(true);

  // * Computed
  /** Panel header shows the name of the loaded playlist (official behavior). */
  header = computed(
    () => this._playlistPlayer.playlistSource()?.title || 'Your Queue',
  );

  /** Current track (null → empty state) */
  track = computed(() => this._musicPlayer.musicSource());
  /** Current track cover URL */
  img = computed(() => this.track()?.img);

  /** Sequential next queued track (null under shuffle / queue end) */
  nextTrack = computed(() => this._playlistPlayer.nextMusic());

  /** Collapses/expands the panel (header X / sliver chevron) */
  toggleOpen() {
    this.open.set(!this.open());
  }
}
