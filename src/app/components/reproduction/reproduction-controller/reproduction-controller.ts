import {
  Component,
  computed,
  effect,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MusicPlayer } from '../../../services/music-player';
import { CommonModule } from '@angular/common';
import { PlaylistPlayer } from '../../../services/playlist-player';
import { SliderController } from '../../ui/slider-controller/slider-controller';

/**
 * Bottom transport bar: play/pause, next/previous, shuffle, restart, seek
 * slider (with silent-scrub lifecycle) and volume. Artwork/title on the
 * left; right cluster is decorative chrome only.
 */
@Component({
  selector: 'app-reproduction-controller',
  imports: [CommonModule, SliderController],
  host: { class: 'flex items-center h-full w-full p-4' },
  templateUrl: './reproduction-controller.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './reproduction-controller.scss',
})
export class ReproductionController {
  // * Services
  protected readonly musicPlayer = inject(MusicPlayer);
  protected readonly playlistPlayer = inject(PlaylistPlayer);

  //#region Music states
  /** Current displayed track (null when nothing loaded) */
  musicSource = this.musicPlayer.musicSource;
  /** Element playing state */
  isMusicPlaying = this.musicPlayer.isMusicPlaying;
  /** Output volume (0–1) */
  volume = this.musicPlayer.volume;
  /** Track duration in seconds */
  duration = this.musicPlayer.duration;
  /** Playback position + origin */
  currentTime = this.musicPlayer.currentTime;
  /** Position as mm:ss */
  currentTimeString = this.musicPlayer.currentTimeString;
  /** Duration as mm:ss */
  durationString = this.musicPlayer.durationString;
  /** Shuffle toggle */
  isShuffle = this.playlistPlayer.isShuffle;
  //#endregion

  //#region State
  /** Bar artwork load failure (swaps to the music-note placeholder) */
  imgError = signal(false);

  constructor() {
    // * Reset the cover-fallback state every time the music changes
    effect(() => {
      this.musicSource();
      this.imgError.set(false);
    });
  }
  //#endregion

  //#region Computed
  /** Transport buttons disabled while no track is loaded */
  disableReproductionControls = computed(() => !this.musicSource());
  /** Playlist buttons disabled while no queue is loaded */
  disablePlaylistControls = computed(
    () => !this.playlistPlayer.playlistSource(),
  );
  //#endregion

  /** Volume icon off/down/up based on the volume level */
  volumeIcon = computed(() => {
    const volume = this.volume();

    if (volume === 0) {
      return 'pi pi-volume-off';
    } else if (volume < 0.5) {
      return 'pi pi-volume-down';
    } else {
      return 'pi pi-volume-up';
    }
  });
}
