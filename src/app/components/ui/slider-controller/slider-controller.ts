import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { HighlightSlider } from '../../../directives/highlight-slider';

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
  value = input(0);
  step = input(1);
  min = input(0);
  max = input(0);
  disabled = input(false);
  colorLeft = input<string>('var(--primary)');
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
