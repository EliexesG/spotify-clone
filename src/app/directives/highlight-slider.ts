import {
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';

/**
 * Paints the Spotify-style progress gradient on a host range input:
 * filled portion to the left of the thumb, track color to the right,
 * colors flip while hovered. Reacts to both bound [value] updates and
 * user input/mouse events — no polling.
 */
@Directive({
  selector: '[appHighlightSlider]',
})
export class HighlightSlider implements OnInit {
  /** Progress-fill color (left of the thumb) */
  colorLeft = input<string>('var(--primary)', {
    alias: 'appHighlightSliderColorLeft',
  });
  /** Track color (right of the thumb) */
  colorRight = input<string>('var(--track)', {
    alias: 'appHighlightSliderColorRight',
  });
  /** Mouse-over state (transparent thumb fill while not hovering) */
  hovering = signal<boolean>(false);

  /**
   * Value of the host slider, bound so the progress fill reacts to
   * programmatic value changes without polling the DOM.
   */
  appHighlightSliderValue = input<number | string>(0);

  private el = inject<ElementRef<HTMLInputElement>>(ElementRef);

  constructor() {
    // * React to every source of value change: bound [value] updates and hovering
    effect(() => {
      this.appHighlightSliderValue();
      this.hovering();
      this.updateSliderBackground();
    });
  }

  // * DOM wiring: user input + hover drive the gradient repaint
  ngOnInit(): void {
    const slider = this.el.nativeElement;

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

    // * Progress percentage within [min, max]
    const value =
      ((+slider.value - +slider.min) / (+slider.max - +slider.min)) * 100;

    // * Filled = hover color left of the thumb; white fill otherwise,
    // * track color right of the thumb
    slider.style.background = `linear-gradient(to right, ${this.hovering() ? this.colorLeft() : 'white'} ${value}%, ${this.colorRight()} ${value}%)`;
  }
}
