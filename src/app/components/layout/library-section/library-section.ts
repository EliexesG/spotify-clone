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
import { SearchButton } from '../../ui/search-button/search-button';

/**
 * Library sidebar panel: expandable/collapsible card list with a live
 * case-insensitive search filter. Composed by the Scaffold, which also
 * arbitrates panel space — the open/closed state is driven through a
 * two-way model so the shell can auto-collapse it on narrow windows
 * (same contract as NowPlayingSection.open).
 */
@Component({
  selector: 'app-library-section',
  imports: [SourceCard, CommonModule, SearchButton],
  templateUrl: './library-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './library-section.scss',
})
export class LibrarySection {
  // * Services
  private readonly _crudPlaylist = inject(CrudPlaylist);

  // * Data
  /** All playlists of the database with tracks resolved */
  playlists = this._crudPlaylist.getAllPlaylists();

  // * State
  /** Two-way search text bound from the SearchButton */
  textSearch = model('');
  /**
   * Whether the panel is open (false = icon rail) — two-way:
   * the shell (Scaffold) can force it closed via the rail when space runs
   * out (same contract as NowPlayingSection.open)
   */
  open = model(true);

  // * Computed
  /** Playlists matching the search text (empty text = all) */
  filteredPlaylists = computed(() => {
    const text = this.textSearch().trim().toLowerCase();

    if (text.trim().length === 0) return this.playlists;

    return this.playlists.filter((playlist) =>
      playlist.title.trim().toLowerCase().includes(text),
    );
  });

  /** Collapses/expands the card list */
  toggleOpen() {
    this.open.set(!this.open());
  }
}
