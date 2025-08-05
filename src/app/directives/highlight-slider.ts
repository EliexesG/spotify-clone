import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

@Directive({
  selector: '[appHighlightSlider]',
})
export class HighlightSlider implements OnInit {
  colorLeft = input<string>('var(--primary)');
  colorRight = input<string>('gray');
  hovering = signal<boolean>(false);

  private lastValue = signal<number | string>(0);
  private destroy$ = inject(DestroyRef);
  private el = inject<ElementRef<HTMLInputElement>>(ElementRef);

  ngOnInit(): void {
    const slider = this.el.nativeElement;
    this.updateSliderBackground();

    // Detect when the slider value changes by the user
    slider.oninput = () => {
      this.updateSliderBackground();
    };

    // Detect changes when the mouse enters the slider or leaves
    slider.onmouseenter = () => {
      this.hovering.set(true);
      this.updateSliderBackground();
    };
    slider.onmouseleave = () => {
      this.hovering.set(false);
      this.updateSliderBackground();
    };

    // Fallback to update the slider background every 100ms when the value changes
    interval(100)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe(() => {
        if (slider.value !== this.lastValue()) {
          this.lastValue.set(slider.value);
          this.updateSliderBackground();
        }
      });
  }

  /**
   * Updates the background style of the slider based on its current value.
   *
   * This method calculates the percentage value of the slider's current position
   * relative to its minimum and maximum range, and applies a linear gradient
   * background style. The gradient changes color dynamically based on whether
   * the slider is being hovered over.
   */
  private updateSliderBackground(): void {
    const slider = this.el.nativeElement;

    if (!slider) return;

    const value =
      ((+slider.value - +slider.min) / (+slider.max - +slider.min)) * 100;

    slider.style.background = `linear-gradient(to right, ${this.hovering() ? this.colorLeft() : 'white'} ${value}%, ${this.colorRight()} ${value}%)`;
  }
}
