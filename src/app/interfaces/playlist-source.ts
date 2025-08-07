import { MusicSource } from './music-source';

export interface PlaylistSource {
  id: string;
  title: string;
  description: string;
  owner: string;
  img: string;
  music: MusicSource[];
}
