import { MusicSource } from './music-source';

/**
 * A playlist entry: metadata plus the ordered track list resolved from
 * `songs.json` by CrudPlaylist.
 */
export interface PlaylistSource {
  id: string;
  title: string;
  /** Free-text playlist description (data only; not displayed) */
  description: string;
  owner: string;
  img: string;
  /** Tracks resolved from the raw id list */
  music: MusicSource[];
}
