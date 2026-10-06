import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CrudPlaylist } from '../../services/crud-playlist';
import { SourceCard } from '../../components/ui/source-card/source-card';

/**
 * Home view (route `''`): the library grid — every playlist rendered as a
 * big SourceCard. Card body navigates to the detail view, cover button plays.
 */
@Component({
  selector: 'app-home-view',
  imports: [SourceCard],
  templateUrl: './home-view.html',
  styleUrl: './home-view.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class HomeView {
  private readonly _crudPlaylist = inject(CrudPlaylist);

  /** All playlists of the database with tracks resolved */
  playlists = this._crudPlaylist.getAllPlaylists();
}
