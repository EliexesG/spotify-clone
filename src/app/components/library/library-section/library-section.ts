import {
  Component,
  computed,
  inject,
  model,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CrudPlaylist } from '../../../services/crud-playlist';
import { SourceCard } from '../../ui/source-card/source-card';
import { CommonModule } from '@angular/common';
import { LibrarySearcher } from '../library-searcher/library-searcher';

@Component({
  selector: 'app-library-section',
  imports: [SourceCard, CommonModule, LibrarySearcher],
  templateUrl: './library-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './library-section.scss',
})
export class LibrarySection {
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

    return this.playlists.filter((playlist) =>
      playlist.title.trim().toLowerCase().includes(text),
    );
  });

  toggleExpanded() {
    this.expanded.set(!this.expanded());
  }
}
