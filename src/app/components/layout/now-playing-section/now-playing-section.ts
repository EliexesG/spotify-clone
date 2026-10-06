import {
  Component,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { PlaylistPlayer } from '../../../services/playlist-player';
import { MusicPlayer } from '../../../services/music-player';
import { ImageFallback } from '../../ui/image-fallback/image-fallback';

/**
 * Right shell panel: mirrors the loaded playlist and current track —
 * playlist name as panel header, large current-track cover with
 * image-fallback, plus title/artist; empty state when nothing loads.
 * Composed by the Scaffold.
 */
@Component({
  selector: 'app-now-playing-section',
  imports: [ImageFallback],
  templateUrl: './now-playing-section.html',
  styleUrl: './now-playing-section.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class NowPlayingSection {
  private readonly _playlistPlayer = inject(PlaylistPlayer);
  private readonly _musicPlayer = inject(MusicPlayer);

  /** Panel header shows the name of the loaded playlist (official behavior). */
  header = computed(
    () => this._playlistPlayer.playlistSource()?.title || 'Your Queue',
  );

  /** Current track (null → empty state) */
  track = computed(() => this._musicPlayer.musicSource());
  /** Current track cover URL */
  img = computed(() => this.track()?.img);
}
