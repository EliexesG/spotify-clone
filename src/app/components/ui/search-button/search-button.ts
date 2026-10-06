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

@Component({
  selector: 'app-search-button',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-button.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './search-button.scss',
})
export class SearchButton {
  opened = signal(false);
  searchTextModel = model('');
  searchText = output<string>();
  /** Site-provided label; defaults to the top-bar search wording */
  placeholder = input('What do you want to play?');
  private readonly _ref = inject(ElementRef);

  constructor() {
    effect(() => this.searchText.emit(this.searchTextModel()));
  }

  // if clicked outside component, close
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this._ref.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  close() {
    this.opened.set(false);
    this.searchTextModel.set('');
  }
}
