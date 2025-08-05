import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { MusicSource } from '../interfaces/music-source';
import { AudioResolver } from './audio-resolver';

@Injectable({
  providedIn: 'root',
})
export class MusicPlayer {
  //#region Services
  private readonly _audioResolver = inject(AudioResolver);
  //#endregion

  //#region Music state
  isMusicPlaying = this._audioResolver.audioReproducing;
  volume = this._audioResolver.audioVolume;
  duration = this._audioResolver.audioDuration;
  currentTime = this._audioResolver.audioCurrentTime;
  //#endregion

  // Default music source or current music source
  private readonly _musicSource = signal<MusicSource | null>(null);

  //#region Computed
  durationString = computed(() => this.formatTime(this.duration()));
  currentTimeString = computed(() =>
    this.formatTime(this.currentTime().currentTime),
  );
  //#endregion

  //#region Getters
  get musicSource(): Signal<MusicSource | null> {
    return this._musicSource.asReadonly();
  }
  //#endregion

  //#region Music Control Methods
  playMusic() {
    this._audioResolver.reproduceAudio();
  }

  pauseMusic() {
    this._audioResolver.pauseAudio();
  }

  stopMusic() {
    this._audioResolver.stopAudio();
  }

  restartMusic() {
    this._audioResolver.restartAudio();
  }

  changeCurrentTime(seconds: number) {
    this._audioResolver.changeAudioCurrentTime(seconds);
  }

  changeVolume(volume: number) {
    this._audioResolver.changeAudioVolume(volume);
  }

  /**
   * Changes the current music source.
   *
   * This function updates the internal music source signal with the provided
   * music object. If the provided music is null, the function returns early.
   * Otherwise, it stops any currently playing music before setting the new source.
   *
   * @param music - The new music source to be set, or null to clear the current source.
   */
  changeMusicSource(music: MusicSource | null) {
    this._musicSource.set(music);
    const currentMusic = this._musicSource();

    if (!currentMusic) return;

    this._audioResolver.setAudio(currentMusic.url);
    this.stopMusic();
  }
  //#endregion

  /**
   * Formats a given time in seconds to a string in the format mm:ss.
   * If the given time is undefined, it returns '00:00'.
   * @param seconds - The time in seconds to be formatted.
   * @returns A string in the format mm:ss.
   */
  private formatTime(seconds: number | undefined): string {
    if (!seconds) return '00:00';

    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);

    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
}
