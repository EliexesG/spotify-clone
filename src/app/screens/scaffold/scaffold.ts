import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReproductionController } from '../../components/reproduction/reproduction-controller/reproduction-controller';
import { PlaylistPlayer } from '../../services/playlist-player';
import { CrudPlaylist } from '../../services/crud-playlist';
import { LibrarySectionContainer } from '../../components/library-section/library-section-container/library-section-container';

@Component({
  selector: 'app-scaffold',
  imports: [RouterOutlet, ReproductionController, LibrarySectionContainer],
  templateUrl: './scaffold.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './scaffold.scss',
})
export class Scaffold {
  private readonly _crudPlaylist = inject(CrudPlaylist);
  private readonly _playlistPlayer = inject(PlaylistPlayer);

  constructor() {
    const defaultPlaylist = this._crudPlaylist.getDefaultPlaylist();

    if (defaultPlaylist)
      this._playlistPlayer.changePlaylistSource(defaultPlaylist);
  }
}
