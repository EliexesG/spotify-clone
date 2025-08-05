import { inject, Injectable } from '@angular/core';
import playlists from '../../../public/db/playlist.json';
import { CrudMusic } from './crud-music';
import { PlaylistSource } from '../interfaces/playlist-source';

@Injectable({
  providedIn: 'root',
})
export class CrudPlaylist {
  private readonly _crudMusic = inject(CrudMusic);

  getPlaylistById(id: string): PlaylistSource | undefined {
    const playlist = playlists.find((playlist) => playlist.id === id);
    const music = playlist?.music.map((musicId) =>
      this._crudMusic.getMusicById(musicId),
    );

    if (!playlist) return undefined;

    return {
      ...playlist,
      music: music || [],
    } as any;
  }

  getAllPlaylists(): PlaylistSource[] | undefined {
    return playlists.map((playlist) => ({
      ...playlist,
      music: playlist.music.map(
        (musicId) => this._crudMusic.getMusicById(musicId)!,
      ),
    }));
  }
}
