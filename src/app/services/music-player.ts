import { computed, Injectable, Signal, signal } from '@angular/core';
import { MusicSource } from '../interfaces/music-source';

@Injectable({
  providedIn: 'root',
})
export class MusicPlayer {
  // * Signals
  private readonly _isMusicPlaying = signal(false);
  private readonly _volume = signal(0); // Volume level from 0 to 1
  private readonly _currentTime = signal(0);

  // Default music source or current music source
  private readonly _musicSource = signal<MusicSource>({
    img: 'https://cdn.shopify.com/s/files/1/0657/3100/2634/files/papierpeintmusique-casqueaudio.png?v=1715586351',
    title: 'Default Title',
    artist: 'EliexesG',
    duration: 180, // Default duration in seconds
  });

  // * Computed
  private readonly _currentTimeString = computed(() =>
    this.formatTime(this._currentTime()),
  );

  private readonly _durationString = computed(() =>
    this.formatTime(this._musicSource().duration),
  );

  //#region Getters
  get isMusicPlaying(): Signal<boolean> {
    return this._isMusicPlaying.asReadonly();
  }

  get musicSource(): Signal<MusicSource> {
    return this._musicSource.asReadonly();
  }

  get currentTime(): Signal<number> {
    return this._currentTime.asReadonly();
  }

  get volume(): Signal<number> {
    return this._volume.asReadonly();
  }

  get currentTimeString(): Signal<string> {
    return this._currentTimeString;
  }

  get durationString(): Signal<string> {
    return this._durationString;
  }
  //#endregion

  //#region Music Control Methods
  playMusic() {
    this._isMusicPlaying.set(true);
  }

  changeCurrentTime(time: number) {
    if (time < 0 || time > (this._musicSource()?.duration || 0)) {
      throw new Error('Time must be between 0 and music duration');
    }

    this._currentTime.set(time);
  }

  changeVolume(volume: number) {
    if (volume < 0 || volume > 1) {
      throw new Error('Volume must be between 0 and 1');
    }

    this._volume.set(volume);
  }

  pauseMusic() {
    this._isMusicPlaying.set(false);
  }

  stopMusic() {
    this._isMusicPlaying.set(false);
  }

  jumpToNext() {}

  jumpToPrevious() {}

  restartMusic() {}
  //#endregion

  private formatTime(seconds: number | undefined): string {
    if (!seconds) return '00:00';

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
}
