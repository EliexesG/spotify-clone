import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReproductionController } from '../../components/reproduction-controller/reproduction-controller';
import { CrudMusic } from '../../services/crud-music';
import { MusicPlayer } from '../../services/music-player';

@Component({
  selector: 'app-scaffold',
  imports: [RouterOutlet, ReproductionController],
  templateUrl: './scaffold.html',
  styleUrl: './scaffold.scss',
})
export class Scaffold {
  private readonly _crudMusic = inject(CrudMusic);
  private readonly _musicPlayer = inject(MusicPlayer);

  constructor() {
    this._musicPlayer.changeMusicSource(
      this._crudMusic.getMusicById('1') || null,
    );
  }
}
