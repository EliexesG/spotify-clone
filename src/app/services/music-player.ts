import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { MusicSource } from '../interfaces/music-source';
import { AudioResolver } from './audio-resolver';

/**
 * Public playback facade over `AudioResolver`: exposes the audio state
 * signals (playing/volume/duration/currentTime) plus the current track
 * selection and the transport controls. `PlaylistPlayer` composes it for
 * queue logic.
 */
@Injectable({
  providedIn: 'root',
})
export class MusicPlayer {
  //#region Services
  private readonly _audioResolver = inject(AudioResolver);
  //#endregion

  //#region Music state
  /** Whether the audio is currently playing */
  isMusicPlaying = this._audioResolver.audioReproducing;
  /** Current output volume (0–1) */
  volume = this._audioResolver.audioVolume;
  /** Loaded track duration in seconds (0 when nothing loaded) */
  duration = this._audioResolver.audioDuration;
  /** Playback position + its origin (element vs controller) */
  currentTime = this._audioResolver.audioCurrentTime;
  //#endregion

  /** The track backing the loaded audio element (null when cleared) */
  private readonly _musicSource = signal<MusicSource | null>(null);

  //#region Computed
  /** Track total length, formatted as mm:ss */
  durationString = computed(() => {
    return this.formatTime(this.duration());
  });
  /** Playback position, formatted as mm:ss */
  currentTimeString = computed(() => {
    return this.formatTime(this.currentTime().currentTime);
  });
  //#endregion

  //#region Getters
  /** Readonly signal of the current track */
  get musicSource(): Signal<MusicSource | null> {
    return this._musicSource.asReadonly();
  }
  //#endregion

  //#region Music Control Methods
  /** Starts playback of the loaded audio element. */
  playMusic() {
    this._audioResolver.reproduceAudio();
  }

  /** Pauses the loaded audio element. */
  pauseMusic() {
    this._audioResolver.pauseAudio();
  }

  /** Stops playback and resets the position to 0. */
  stopMusic() {
    this._audioResolver.stopAudio();
  }

  /** Seeks to 0 and starts playback. */
  restartMusic() {
    this._audioResolver.restartAudio();
  }

  /**
   * Seeks the loaded audio element to the given position.
   *
   * @param seconds - Target position in seconds (must be within [0, duration])
   * @throws {Error} when seconds is out of range (from AudioResolver)
   */
  changeCurrentTime(seconds: number) {
    this._audioResolver.changeAudioCurrentTime(seconds);
  }

  /**
   * Begins a seek-bar scrub: pauses playback (remembering its state) and
   * switches the current time into preview-only mode until endScrub().
   */
  beginScrub() {
    this._audioResolver.beginScrub();
  }

  /**
   * Ends a seek-bar scrub: seeks to the committed position and resumes
   * playback when it was playing before the scrub began.
   *
   * @param commitAt - The committed slider value at release (optional).
   */
  endScrub(commitAt?: number) {
    this._audioResolver.endScrub(commitAt);
  }

  /**
   * Changes the output volume.
   *
   * @param volume - Target volume (0–1)
   * @throws {Error} when volume is out of range (from AudioResolver)
   */
  changeVolume(volume: number) {
    this._audioResolver.changeAudioVolume(volume);
  }

  /**
   * Changes the current music source.
   *
   * This function updates the internal music source signal with the provided
   * music object. If the provided music is null, it clears the audio state
   * (stopping any playback). Otherwise, it stops the current playback and
   * loads the new track's audio element.
   *
   * @param music - The new music source to be set, or null to clear the current source.
   */
  changeMusicSource(music: MusicSource | null) {
    if (!music) {
      this._musicSource.set(null);
      this._audioResolver.clearAudio();
      return;
    }

    this._musicSource.set(music);
    this.stopMusic();
    this._audioResolver.setAudio(music.url);
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
