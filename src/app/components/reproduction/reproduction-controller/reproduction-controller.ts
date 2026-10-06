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
  musicSource = this.musicPlayer.musicSource;
  isMusicPlaying = this.musicPlayer.isMusicPlaying;
  volume = this.musicPlayer.volume;
  duration = this.musicPlayer.duration;
  currentTime = this.musicPlayer.currentTime;
  currentTimeString = this.musicPlayer.currentTimeString;
  durationString = this.musicPlayer.durationString;
  isShuffle = this.playlistPlayer.isShuffle;
  //#endregion

  //#region State
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
  disableReproductionControls = computed(() => !this.musicSource());
  disablePlaylistControls = computed(
    () => !this.playlistPlayer.playlistSource(),
  );
  //#endregion

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
