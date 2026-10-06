import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  model,
  output,
  signal,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Expandable search pill: renders as a small search icon that opens into an
 * inline text input on click, collapses (and clears the text) when clicking
 * outside. Emits every text change through `searchText` — consumers bind it
 * to their own filter signals.
 */
@Component({
  selector: 'app-search-button',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-button.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './search-button.scss',
})
export class SearchButton {
  /** Whether the text input is expanded */
  opened = signal(false);
  /** Two-way bound search text */
  searchTextModel = model('');
  /** Emitted on every text change (consumers apply their own filter) */
  searchText = output<string>();
  /** Site-provided label; defaults to the top-bar search wording */
  placeholder = input('What do you want to play?');
  private readonly _ref = inject(ElementRef);

  constructor() {
    // * Re-emit the model on every change (keeps [(ngModel)] + output in sync)
    effect(() => this.searchText.emit(this.searchTextModel()));
  }

  // if clicked outside component, close
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this._ref.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  /** COLLAPSES the pill and clears the current text */
  close() {
    this.opened.set(false);
    this.searchTextModel.set('');
  }
}
