export interface MusicSource {
  id: string;
  img: string;
  title: string;
  artist: string;
  url: string;
  /** Detail-table column (official app); rendered as '—' when missing */
  album?: string;
  /** Detail-table column (ISO date string); rendered as '—' when missing */
  dateAdded?: string;
  /** Row duration in seconds (real: measured from the wav file) */
  durationSeconds?: number;
}
