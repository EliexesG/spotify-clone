import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CrudPlaylist } from '../../services/crud-playlist';
import { SourceCard } from '../../components/ui/source-card/source-card';

@Component({
  selector: 'app-home-view',
  imports: [SourceCard],
  templateUrl: './home-view.html',
  styleUrl: './home-view.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class HomeView {
  private readonly _crudPlaylist = inject(CrudPlaylist);

  playlists = this._crudPlaylist.getAllPlaylists();
}
