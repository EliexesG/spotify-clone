import { Component, computed, inject } from '@angular/core';
import { MusicPlayer } from '../../services/music-player';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Slider } from '../slider/slider';
import { PlaylistPlayer } from '../../services/playlist-player';

@Component({
  selector: 'app-reproduction-controller',
  imports: [CommonModule, FormsModule, Slider],
  host: { class: 'flex items-center h-full w-full p-4' },
  templateUrl: './reproduction-controller.html',
  styleUrl: './reproduction-controller.scss',
})
export class ReproductionController {
  // * Services
  protected readonly musicPlayer = inject(MusicPlayer);
  protected readonly playlistPlayer = inject(PlaylistPlayer);

  // * Signals
  protected readonly musicSource = this.musicPlayer.musicSource;
  protected readonly isMusicPlaying = this.musicPlayer.isMusicPlaying;
  protected readonly volume = this.musicPlayer.volume;
  protected readonly duration = this.musicPlayer.duration;
  protected readonly currentTime = this.musicPlayer.currentTime;
  protected readonly currentTimeString = this.musicPlayer.currentTimeString;
  protected readonly durationString = this.musicPlayer.durationString;

  //#region Computed
  disableReproductionControls = computed(() => !this.musicSource());

  // Disable next and previous selects
  disableJumpToPrevious = computed(
    () =>
      !this.playlistPlayer.hasPreviousMusic() ||
      this.disableReproductionControls(),
  );
  disableJumpToNext = computed(
    () =>
      !this.playlistPlayer.hasNextMusic() || this.disableReproductionControls(),
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
