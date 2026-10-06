import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { HighlightSlider } from '../../../directives/highlight-slider';

/**
 * Generic Spotify-style range slider (used for seek and volume). Wraps a
 * native input[type=range] styled via HighlightSlider, and emits distinct
 * events for live value changes and value commits (scrub lifecycle).
 */
@Component({
  selector: 'app-slider-controller',
  imports: [HighlightSlider],
  host: { class: 'w-full' },
  templateUrl: './slider-controller.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './slider-controller.scss',
})
export class SliderController {
  // * Outputs
  /** Live value while the user drags (native `input` event) */
  valueChanged = output<number>();

  /**
   * Emitted when the user grabs the slider (pointer down). Hosts use it to
   * enter scrub mode (e.g. pause audio while the seek bar is dragged).
   */
  dragStarted = output<void>();

  /**
   * Emitted when the slider value is committed (pointer release, pointercancel
   * or change event). Carries the element's actual committed value so hosts can
   * apply the final position independently of preview updates.
   */
  dragEnded = output<number>();

  // * Inputs
  /** Current value (bound back from the host for programmatic updates) */
  value = input(0);
  /** Value granularity */
  step = input(1);
  /** Minimum allowed value */
  min = input(0);
  /** Maximum allowed value */
  max = input(0);
  /** Disables interaction */
  disabled = input(false);
  /** Progress-fill color (left of the thumb) */
  colorLeft = input<string>('var(--primary)');
  /** Track color (right of the thumb) */
  colorRight = input<string>('var(--track)');

  /**
   * Emits the new value of the slider when it changes.
   *
   * This function is triggered when the slider value changes, retrieves the current
   * value from the event's target, and emits it using the `valueChanged` output.
   *
   * @param event - The event object containing the slider change data.
   */
  changed(event: Event) {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    this.valueChanged.emit(value);
  }

  /**
   * Emits the committed value of the slider on release (pointerup,
   * pointercancel or change), read straight from the element.
   */
  commit(event: Event) {
    this.dragEnded.emit((event.target as HTMLInputElement).valueAsNumber);
  }
}
