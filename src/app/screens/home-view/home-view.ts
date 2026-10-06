import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CrudPlaylist } from '../../services/crud-playlist';
import { LibraryCard } from '../../components/library-section/library-card/library-card';

@Component({
  selector: 'app-home-view',
  imports: [LibraryCard],
  templateUrl: './home-view.html',
  styleUrl: './home-view.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class HomeView {
  private readonly _crudPlaylist = inject(CrudPlaylist);

  playlists = this._crudPlaylist.getAllPlaylists();
}
