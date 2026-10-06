import {
  Component,
  computed,
  effect,
  input,
  signal,
  untracked,
  ChangeDetectionStrategy,
} from '@angular/core';

/**
 * Shared cover-image component with automatic error fallback.
 *
 * Renders the source image and, when it fails to load (or no src is
 * provided), swaps to a music-note placeholder block (or projected custom
 * fallback content). Owns the error/reset state so consumers never
 * hand-roll the `(error)` pattern:
 *
 * ```html
 * <app-image-fallback class="w-14 h-14 relative" [src]="img()" />
 * ```
 */
@Component({
  selector: 'app-image-fallback',
  imports: [],
  templateUrl: './image-fallback.html',
  styleUrl: './image-fallback.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ImageFallback {
  /** Image source; undefined/empty renders the placeholder directly */
  src = input<string | undefined>();
  /** Accessibility label for the rendered image */
  alt = input('Cover');
  /** Extra classes for the inner <img> (sizing/object-cover variants) */
  imgClass = input('');

  // * State
  /** Load failure flag (drives the placeholder swap) */
  imgError = signal(false);

  /** Whether the fallback block should show */
  showFallback = computed(() => !this.src() || this.imgError());

  constructor() {
    effect(() => {
      // * Any src change resets the fallback flag
      this.src();

      // * The reset write must NOT turn imgError into a dependency of this
      // * effect, or it would clear the just-raised error (proven pattern)
      untracked(() => this.imgError.set(false));
    });
  }
}
