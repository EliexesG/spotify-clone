import { Component, computed, inject, model, signal } from '@angular/core';
import { CrudPlaylist } from '../../../services/crud-playlist';
import { LibraryCard } from '../library-card/library-card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-library-section',
  imports: [LibraryCard, CommonModule],
  templateUrl: './library-section.html',
  styleUrl: './library-section.scss',
})
export class LibrarySection {
  // * Services
  private readonly _crudPlaylist = inject(CrudPlaylist);

  // * Data
  playlists = this._crudPlaylist.getAllPlaylists();

  // * State
  textSearch = model('');
  expanded = signal(false);

  // * Computed
  filteredPlaylists = computed(() => {
    const text = this.textSearch();

    if (text.trim().length === 0) return this.playlists;

    return this.playlists?.filter((playlist) => playlist.title.includes(text));
  });

  toggleExpanded() {
    this.expanded.set(!this.expanded());
  }
}
