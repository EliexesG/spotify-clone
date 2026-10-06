import { Injectable } from '@angular/core';
import music from '../../../public/db/songs.json';
import { MusicSource } from '../interfaces/music-source';

/**
 * Query helper over the static `songs.json` "database".
 */
@Injectable({
  providedIn: 'root',
})
export class CrudMusic {
  /**
   * Looks up a track by its id.
   *
   * @param id - Track id from `songs.json`
   * @returns The matching MusicSource, or undefined when the id does not exist
   */
  getMusicById(id: string): MusicSource | undefined {
    return music.find((music) => music.id === id);
  }
}
