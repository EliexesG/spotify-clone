import { Injectable } from '@angular/core';
import music from '../../../public/db/songs.json';
import { MusicSource } from '../interfaces/music-source';

@Injectable({
  providedIn: 'root',
})
export class CrudMusic {
  getMusicById(id: string): MusicSource | undefined {
    return music.find((music) => music.id === id);
  }

  getAllMusic(): MusicSource[] {
    return music;
  }
}
