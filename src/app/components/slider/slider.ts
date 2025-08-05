import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-slider',
  imports: [],
  host: { class: 'w-full' },
  templateUrl: './slider.html',
  styleUrl: './slider.scss',
})
export class Slider {
  // * Outputs
  valueChanged = output<number>();

  // * Inputs
  value = input(0);
  step = input(1);
  min = input(0);
  max = input(0);
  disabled = input(false);

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
    console.log("🚀 ~ Slider ~ changed ~ value:", value)
    this.valueChanged.emit(value);
  }
}
