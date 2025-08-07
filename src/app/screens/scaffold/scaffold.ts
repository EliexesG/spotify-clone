import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReproductionController } from '../../components/reproduction/reproduction-controller/reproduction-controller';
import { PlaylistPlayer } from '../../services/playlist-player';
import { CrudPlaylist } from '../../services/crud-playlist';
import { LibrarySection } from '../../components/sections/library-section/library-section';

@Component({
  selector: 'app-scaffold',
  imports: [RouterOutlet, ReproductionController, LibrarySection],
  templateUrl: './scaffold.html',
  styleUrl: './scaffold.scss',
})
export class Scaffold {
  private readonly _crudPlaylist = inject(CrudPlaylist);
  private readonly _playlistPlayer = inject(PlaylistPlayer);

  constructor() {
    this._playlistPlayer.changePlaylistSource(
      this._crudPlaylist.getPlaylistById('1') || null,
    );
  }
}
