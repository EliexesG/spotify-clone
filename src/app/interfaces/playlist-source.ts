import { MusicSource } from './music-source';

export interface PlaylistSource {
  id: string;
  name: string;
  description: string;
  owner: string;
  img: string;
  music: MusicSource[];
}
