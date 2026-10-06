import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
  ChangeDetectionStrategy,
} from '@angular/core';
import { PlaylistPlayer } from '../../../services/playlist-player';
import { MusicPlayer } from '../../../services/music-player';

@Component({
  selector: 'app-now-playing-section',
  imports: [],
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

  track = computed(() => this._musicPlayer.musicSource());
  img = computed(() => this.track()?.img);

  // * State
  imgError = signal(false);

  constructor() {
    effect(() => {
      this.track();

      // * Reset the fallback state on track change without depending on
      // * imgError itself (same pattern as SourceCard)
      untracked(() => this.imgError.set(false));
    });
  }
}
