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
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-library-searcher',
  imports: [CommonModule, FormsModule],
  templateUrl: './library-searcher.html',
  styleUrl: './library-searcher.scss',
})
export class LibrarySearcher {
  opened = signal(false);
  searchTextModel = model('');
  searchText = output<string>();
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
