import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReproductionController } from '../../components/reproduction-controller/reproduction-controller';
import { PlaylistPlayer } from '../../services/playlist-player';
import { CrudPlaylist } from '../../services/crud-playlist';

@Component({
  selector: 'app-scaffold',
  imports: [RouterOutlet, ReproductionController],
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
