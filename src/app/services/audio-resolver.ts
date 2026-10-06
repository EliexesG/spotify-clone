import {
  DestroyRef,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
} from '@angular/core';
import { CurrentTime } from '../interfaces/current-time';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class AudioResolver {
  private readonly _audio = new BehaviorSubject<HTMLAudioElement | null>(null);
  private readonly _audioEnded = new Subject<HTMLAudioElement>();
  private destroy$ = inject(DestroyRef);

  //#region Signals
  private readonly _audioReproducing = signal(false);
  private readonly _audioVolume = signal(0.5);
  private readonly _audioDuration = signal(0);
  private readonly _audioCurrentTime = signal<CurrentTime>({
    currentTime: 0,
    cause: 'reproduction',
  });
  private readonly _audioError = signal<string | null>(null);
  private readonly _audioBuffering = signal(false);
  private readonly _scrubbing = signal(false);

  /**
   * Whether the audio was playing when the scrub began, so playback
   * can resume on scrub end.
   */
  private _resumeOnScrubEnd = false;

  /**
   * Listeners attached to the current audio element, kept as
   * [element, type, handler] tuples so they can be detached in setAudio/clearAudio.
   */
  private _currentListeners: Array<{
    element: HTMLAudioElement;
    type: string;
    handler: EventListener;
  }> = [];
  //#endregion

  //#region Getters
  get audio(): Observable<HTMLAudioElement | null> {
    return this._audio.asObservable();
  }

  /**
   * Emits the audio element every time its playback ends.
   * Listeners on the raw element have to be avoided to not overwrite
   * internal ended-bookkeeping (multiple subscribers coexist via this stream).
   */
  get audioEnded(): Observable<HTMLAudioElement> {
    return this._audioEnded.asObservable();
  }

  get audioError(): Signal<string | null> {
    return this._audioError.asReadonly();
  }

  get audioBuffering(): Signal<boolean> {
    return this._audioBuffering.asReadonly();
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

  get audioCurrentTime(): Signal<CurrentTime> {
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

      // * While scrubbing the signal only previews the dragged position:
      // * the element must not seek (that is what makes the bar "sound")
      if (this._scrubbing()) return;

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
      this.detachAudioListeners();

      if (!audio) {
        this._audioDuration.set(0);
        return;
      }

      // * Initial config
      const el = audio;
      el.volume = this._audioVolume();
      el.currentTime = this._audioCurrentTime().currentTime;

      // * Listeners (addEventListener keeps coexisting subscribers safe:
      // * assigning audio.onended would silently overwrite other owners)
      const listener = (type: string, handler: CallableFunction) => {
        const typedHandler = handler as EventListener;
        el.addEventListener(type, typedHandler);
        this._currentListeners.push({
          element: el,
          type,
          handler: typedHandler,
        });
      };

      listener('timeupdate', () => {
        // * While scrubbing the preview owns the UI: stale in-flight updates
        // * (queued before the scrub pause) would clobber the dragged position
        if (this._scrubbing()) return;

        this._audioCurrentTime.set({
          currentTime: el.currentTime,
          cause: 'reproduction',
        });
      });

      listener('ended', () => {
        this._audioReproducing.set(false);
        this._audioEnded.next(el);
      });

      listener('play', () => {
        this._audioReproducing.set(true);
      });

      listener('pause', () => {
        this._audioReproducing.set(false);
      });

      listener('canplay', () => {
        this._audioBuffering.set(false);
        this._audioError.set(null);
        this._audioDuration.set(Math.round(el.duration));
      });

      listener('waiting', () => {
        this._audioBuffering.set(true);
      });

      listener('error', () => {
        this._audioReproducing.set(false);
        const message = `Failed to load audio: ${el.currentSrc || el.src}`;
        this._audioError.set(message);
        console.warn(message);
      });
    });
  }

  /**
   * Removes every listener previously attached to an audio element.
   */
  private detachAudioListeners() {
    this._currentListeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this._currentListeners = [];
  }

  /**
   * Clears the current audio element, resets the playback signals and stops playback.
   */
  clearAudio() {
    const audio = this._audio.getValue();
    this.detachAudioListeners();

    if (audio) {
      audio.pause();
      audio.remove();
    }

    this._audio.next(null);
    this._audioReproducing.set(false);
    this._audioDuration.set(0);
    this._audioCurrentTime.set({ currentTime: 0, cause: 'controller' });
    this._audioError.set(null);
    this._audioBuffering.set(false);
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
    // destroy previous one
    this.detachAudioListeners();
    this._audioError.set(null);
    this._audioBuffering.set(false);
    const previous = this._audio.getValue();
    previous?.pause();
    previous?.remove();
    this._audio.next(null);
    this._audio.next(new Audio(url));
  }

  /**
   * Reproduces the current audio.
   *
   * This function sets the internal reproduction signal to true, which will
   * trigger the audio element to start playing if it is not already playing.
   */
  reproduceAudio() {
    const audio = this._audio.getValue();

    if (audio && audio.error) {
      // * A previously-failed load can be retried: load() clears the media
      // * error state and re-queues the source for playback
      const message = `Audio source was in error state, retrying load: ${audio.currentSrc || audio.src}`;
      this._audioError.set(null);
      console.warn(message);
      audio.load();
    }

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
   * Begins a scrub (seek-bar drag).
   *
   * Remembers whether the audio was playing, pauses it so nothing sounds
   * while the user moves the bar, and switches the current-time signal into
   * preview-only mode (the seek effect stops writing to the element).
   */
  beginScrub() {
    if (this._scrubbing()) return;

    this._resumeOnScrubEnd = this._audioReproducing();

    if (this._resumeOnScrubEnd) this.pauseAudio();

    this._scrubbing.set(true);
  }

  /**
   * Ends a scrub (seek-bar release).
   *
   * Seeks to the committed position once — directly and synchronously, before
   * any resume — and resumes playback when the audio was playing before the
   * scrub began. When the committed position equals the element position
   * (e.g. a click with no value change) it just resumes. Safe no-op when no
   * scrub is active.
   *
   * @param commitAt - The committed slider value at release. Falls back to
   *                   the last previewed position when omitted.
   */
  endScrub(commitAt?: number) {
    if (!this._scrubbing()) return;

    this._scrubbing.set(false);

    const audio = this._audio.getValue();
    const target = commitAt ?? this._audioCurrentTime().currentTime;

    if (audio && Math.abs(audio.currentTime - target) > 0.01) {
      this._audioCurrentTime.set({ currentTime: target, cause: 'controller' });
      audio.currentTime = target;
    }

    if (this._resumeOnScrubEnd) {
      this._resumeOnScrubEnd = false;
      this.reproduceAudio();
    }
  }

  /**
   * Changes the current time of the audio to the given seconds.
   *
   * This function updates the internal current time signal to the given
   * seconds, and triggers the audio element to seek to that time if it is
   * not already at that time. While scrubbing it only previews the position
   * (the actual seek happens on endScrub).
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
