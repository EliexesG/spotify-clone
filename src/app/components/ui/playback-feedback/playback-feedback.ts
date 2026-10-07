import {
  Component,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AudioResolver } from '../../../services/audio-resolver';

/**
 * Playback diagnostics UI (bottom-center toast): surfaces the resolver's
 * error (persistent pill until the next canplay/source change clears it)
 * and buffering state (loading-spinner pill while a track is waiting but
 * not actively playing). Purely presentational over AudioResolver
 * signals; no playback logic.
 */
@Component({
  selector: 'app-playback-feedback',
  templateUrl: './playback-feedback.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './playback-feedback.scss',
})
export class PlaybackFeedback {
  // * Services
  /** Error/buffering/reproduction state source */
  private readonly _audioResolver = inject(AudioResolver);

  // * Signals
  /** Load/playback failure (asset unavailable, decode failure, ...) */
  error = this._audioResolver.audioError;
  /** Whether the current track is stalled waiting for data */
  buffering = this._audioResolver.audioBuffering;
  /** Whether audio is reproducing (buffering is only shown when paused) */
  reproducing = this._audioResolver.audioReproducing;

  // * Computed
  /** Show the "Buffering…" pill: stalled without active reproduction */
  showBuffering = computed(() => this.buffering() && !this.reproducing());
}
