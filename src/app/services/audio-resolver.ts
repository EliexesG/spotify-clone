import {
  DestroyRef,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
} from '@angular/core';
import { currentTime } from '../interfaces/current-time';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class AudioResolver {
  private readonly _audio = new BehaviorSubject<HTMLAudioElement | null>(null);
  private destroy$ = inject(DestroyRef);

  //#region Signals
  private readonly _audioReproducing = signal(false);
  private readonly _audioVolume = signal(0.5);
  private readonly _audioDuration = signal(0);
  private readonly _audioCurrentTime = signal<currentTime>({
    currentTime: 0,
    cause: 'reproduction',
  });
  //#endregion

  //#region Getters
  get audio(): Observable<HTMLAudioElement | null> {
    return this._audio.asObservable();
  }

  get audioReproducing(): Signal<boolean> {
    return this._audioReproducing.asReadonly();
  }

  get audioVolume(): Signal<number> {
    return this._audioVolume.asReadonly();
  }

  get audioDuration(): Signal<number> {
    return this._audioDuration.asReadonly();
  }

  get audioCurrentTime(): Signal<currentTime> {
    return this._audioCurrentTime.asReadonly();
  }
  //#endregion

  /**
   * This constructor sets up the audio element and the reproduction, volume and current time listeners.
   * It also sets up the effects for the reproduction, volume and current time.
   * The effects listen to the respective signals and update the audio element accordingly.
   * The reproduction effect plays or pauses the audio based on the reproduction signal.
   * The volume effect updates the volume of the audio based on the volume signal.
   * The current time effect updates the current time of the audio based on the current time signal.
   */
  constructor() {
    this.loadAudioSubcription();

    // * For reproduction
    effect(() => {
      const audio = this._audio.getValue();
      const audioReproducing = this._audioReproducing();

      if (!audio) return;

      if (audioReproducing && audio.paused) {
        // audio.currentTime = this._audioCurrentTime().currentTime;
        audio.play();
      } else if (!audioReproducing && !audio.paused) audio.pause();
    });

    // * For volume
    effect(() => {
      const audio = this._audio.getValue();
      const audioVolume = this._audioVolume();

      if (!audio) return;

      audio.volume = audioVolume;
    });

    // * For current time
    effect(() => {
      const audio = this._audio.getValue();
      const audioCurrentTime = this._audioCurrentTime();

      if (!audio || audioCurrentTime.cause === 'reproduction') return;

      audio.currentTime = audioCurrentTime.currentTime;
    });
  }

  /**
   * This function handles all the logic related to the audio object.
   * It sets up the initial configuration of the audio, and listens to the audio
   * events to update the signals accordingly.
   * It also takes care of cleaning up the subscription when the component is
   * destroyed.
   */
  private loadAudioSubcription() {
    this._audio.pipe(takeUntilDestroyed(this.destroy$)).subscribe((audio) => {
      if (!audio) {
        this._audioDuration.set(0);
        return;
      }

      // * Initial config
      audio.volume = this._audioVolume();
      audio.currentTime = this._audioCurrentTime().currentTime;

      // * Listeners
      audio.ontimeupdate = async () => {
        this._audioCurrentTime.set({
          currentTime: audio.currentTime,
          cause: 'reproduction',
        });
      };

      audio.onended = () => {
        this._audioReproducing.set(false);
      };

      audio.onplay = () => {
        this._audioReproducing.set(true);
      };

      audio.onpause = () => {
        this._audioReproducing.set(false);
      };

      audio.oncanplay = () => {
        this._audioDuration.set(Math.round(audio.duration));
      };
    });
  }

  /**
   * Sets the audio source to a new URL.
   *
   * This function creates a new HTMLAudioElement with the given URL
   * and updates the internal audio observable to emit this new audio element.
   *
   * @param url - The URL of the audio file to be set as the source.
   */
  setAudio(url: string) {
    this._audio.next(new Audio(url));
  }

  /**
   * Reproduces the current audio.
   *
   * This function sets the internal reproduction signal to true, which will
   * trigger the audio element to start playing if it is not already playing.
   */
  reproduceAudio() {
    this._audioReproducing.set(true);
  }

  /**
   * Pauses the current audio playback.
   *
   * This function sets the internal reproduction signal to false, which will
   * trigger the audio element to pause if it is currently playing.
   */
  pauseAudio() {
    this._audioReproducing.set(false);
  }

  /**
   * Stops the current audio playback and resets the current time to 0.
   *
   * This function sets the internal reproduction signal to false, which will
   * trigger the audio element to stop playing if it is currently playing.
   * It also sets the internal current time signal to 0, which will update the
   * current time of the audio element.
   */
  stopAudio() {
    this._audioReproducing.set(false);
    this._audioCurrentTime.set({ currentTime: 0, cause: 'controller' });
  }

  /**
   * Restarts the current audio playback from the beginning.
   *
   * This function sets the internal current time signal to 0, which will
   * update the current time of the audio element, and then triggers the
   * audio element to start playing by setting the internal reproduction
   * signal to true.
   */
  restartAudio() {
    this._audioCurrentTime.set({ currentTime: 0, cause: 'controller' });
    this._audioReproducing.set(true);
  }

  /**
   * Changes the current time of the audio to the given seconds.
   *
   * This function updates the internal current time signal to the given
   * seconds, and triggers the audio element to seek to that time if it is
   * not already at that time.
   *
   * @param seconds - The new time in seconds to be set as the current time.
   * @throws {Error} If the given time is outside the range of 0 to the duration of the audio.
   */
  changeAudioCurrentTime(seconds: number) {
    if (seconds < 0 || seconds > this.audioDuration()) {
      throw new Error('Time must be between 0 and music duration');
    }

    this._audioCurrentTime.set({
      currentTime: seconds,
      cause: 'controller',
    });
  }

  /**
   * Changes the audio volume to the specified level.
   *
   * This function updates the internal volume signal to the provided value,
   * clamping it within the valid range of 0 to 1. If the specified volume
   * is outside this range, an error is thrown.
   *
   * @param volume - A number between 0 and 1 representing the desired volume level.
   * @throws {Error} If the given volume is outside the range of 0 to 1.
   */
  changeAudioVolume(volume: number) {
    if (volume < 0 || volume > 1) {
      throw new Error('Volume must be between 0 and 1');
    }

    this._audioVolume.set(volume);
  }
}
