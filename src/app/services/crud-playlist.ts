import { inject, Injectable } from '@angular/core';
import playlists from '../../../public/db/playlist.json';
import { CrudMusic } from './crud-music';
import { PlaylistSource } from '../interfaces/playlist-source';
import { MusicSource } from '../interfaces/music-source';

/**
 * Fallback playlist used at bootstrap; falls back to the first playlist of
 * the database when the entry does not exist anymore.
 */
const DEFAULT_PLAYLIST_ID = '1';

@Injectable({
  providedIn: 'root',
})
export class CrudPlaylist {
  private readonly _crudMusic = inject(CrudMusic);

  /**
   * Resolves the track ids of a raw playlist entry into MusicSource objects.
   * Reports (instead of silently dropping) ids that do not resolve.
   */
  private resolveMusic(musicIds: string[], playlistId: string): MusicSource[] {
    const resolved: MusicSource[] = [];
    const missing: string[] = [];

    musicIds.forEach((musicId) => {
      const music = this._crudMusic.getMusicById(musicId);

      if (music) resolved.push(music);
      else missing.push(musicId);
    });

    if (missing.length)
      console.warn(
        `Playlist "${playlistId}" references missing songs: ${missing.join(', ')}`,
      );

    return resolved;
  }

  getPlaylistById(id: string): PlaylistSource | undefined {
    const playlist = playlists.find((playlist) => playlist.id === id);

    if (!playlist) return undefined;

    return {
      ...playlist,
      music: this.resolveMusic(playlist.music, playlist.id),
    };
  }

  getAllPlaylists(): PlaylistSource[] {
    return playlists.map((playlist) => ({
      ...playlist,
      music: this.resolveMusic(playlist.music, playlist.id),
    }));
  }

  /**
   * The default playlist loaded at bootstrap.
   */
  getDefaultPlaylist(): PlaylistSource | null {
    return (
      this.getPlaylistById(DEFAULT_PLAYLIST_ID) ||
      this.getAllPlaylists()[0] ||
      null
    );
  }
}
