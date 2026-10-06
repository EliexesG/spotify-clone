import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReproductionController } from '../../reproduction/reproduction-controller/reproduction-controller';
import { PlaylistPlayer } from '../../../services/playlist-player';
import { CrudPlaylist } from '../../../services/crud-playlist';
import { LibrarySection } from '../library-section/library-section';
import { NowPlayingSection } from '../now-playing-section/now-playing-section';
import { TopBar } from '../top-bar/top-bar';

@Component({
  selector: 'app-scaffold',
  imports: [RouterOutlet, ReproductionController, LibrarySection, NowPlayingSection, TopBar],
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
