import { Component, computed, effect, inject, model } from '@angular/core';
import { MusicPlayer } from '../../services/music-player';
import { Slider } from 'primeng/slider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reproduction-controller',
  imports: [CommonModule, FormsModule, Slider],
  host: { class: 'w-full h-full' },
  templateUrl: './reproduction-controller.html',
  styleUrl: './reproduction-controller.scss',
})
export class ReproductionController {
  private readonly _musicPlayer = inject(MusicPlayer);

  // * Getters
  protected readonly isMusicPlaying = this._musicPlayer.isMusicPlaying;
  protected readonly musicSource = this._musicPlayer.musicSource;
  protected readonly currentTimeString = this._musicPlayer.currentTimeString;
  protected readonly durationString = this._musicPlayer.durationString;

  // * Models
  protected readonly volume = model(this._musicPlayer.volume());
  protected readonly currentTime = model(this._musicPlayer.currentTime());

  // * Computed
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

  constructor() {
    effect(() => this._musicPlayer.changeVolume(this.volume()));
    effect(() => this._musicPlayer.changeCurrentTime(this.currentTime()));
  }

  playMusic() {
    this._musicPlayer.playMusic();
  }

  pauseMusic() {
    this._musicPlayer.pauseMusic();
  }

  stopMusic() {
    this._musicPlayer.stopMusic();
  }

  changeVolume(volume: number) {
    this._musicPlayer.changeVolume(volume);
  }

  jumpToNext() {
    this._musicPlayer.jumpToNext();
  }

  jumpToPrevious() {
    this._musicPlayer.jumpToPrevious();
  }

  restartMusic() {
    this._musicPlayer.restartMusic();
  }
}
