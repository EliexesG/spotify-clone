import { Component, computed, inject, model, signal } from '@angular/core';
import { CrudPlaylist } from '../../../services/crud-playlist';
import { LibraryCard } from '../library-card/library-card';
import { CommonModule } from '@angular/common';
import { LibrarySearcher } from '../library-searcher/library-searcher';

@Component({
  selector: 'app-library-section-container',
  imports: [LibraryCard, CommonModule, LibrarySearcher],
  templateUrl: './library-section-container.html',
  styleUrl: './library-section-container.scss',
})
export class LibrarySectionContainer {
  // * Services
  private readonly _crudPlaylist = inject(CrudPlaylist);

  // * Data
  playlists = this._crudPlaylist.getAllPlaylists();

  // * State
  textSearch = model('');
  expanded = signal(true);

  // * Computed
  filteredPlaylists = computed(() => {
    const text = this.textSearch().trim().toLowerCase();

    if (text.trim().length === 0) return this.playlists;

    return this.playlists?.filter((playlist) =>
      playlist.title.trim().toLowerCase().includes(text),
    );
  });

  toggleExpanded() {
    this.expanded.set(!this.expanded());
  }
}
