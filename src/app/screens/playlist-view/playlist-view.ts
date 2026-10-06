import {
  Component,
  computed,
  inject,
  input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CrudPlaylist } from '../../services/crud-playlist';
import { PlaylistPlayer } from '../../services/playlist-player';
import { MusicPlayer } from '../../services/music-player';
import { SearchButton } from '../../components/ui/search-button/search-button';
import { MusicSource } from '../../interfaces/music-source';

@Component({
  selector: 'app-playlist-view',
  imports: [CommonModule, DatePipe, RouterLink, SearchButton],
  templateUrl: './playlist-view.html',
  styleUrl: './playlist-view.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class PlaylistView {
  private readonly _crudPlaylist = inject(CrudPlaylist);
  protected readonly _playlistPlayer = inject(PlaylistPlayer);
  protected readonly _musicPlayer = inject(MusicPlayer);

  id = input<string>();

  playlist = computed(() =>
    this._crudPlaylist.getPlaylistById(this.id() || ''),
  );

  songs = computed(() => this.playlist()?.music ?? []);

  /** Owner-requested: the action-row search filters the track table */
  trackFilter = signal('');

  filteredSongs = computed(() => {
    const text = this.trackFilter().trim().toLowerCase();

    if (!text) return this.songs();

    return this.songs().filter((track) =>
      track.title.trim().toLowerCase().includes(text),
    );
  });

  currentTrack = computed(() => this._musicPlayer.musicSource());

  songCount = computed(() => this.songs().length);

  totalDuration = computed(() =>
    this.songs().reduce((acc, track) => acc + (track.durationSeconds ?? 0), 0),
  );

  isCurrentTrack(track: MusicSource) {
    return this.currentTrack()?.id === track.id;
  }

  /** True when THIS playlist is the loaded queue and it is playing. */
  isPlaying = computed(() => {
    const playingPlaylist = this._playlistPlayer.playlistSource()?.id;
    return playingPlaylist === this.id() && this._musicPlayer.isMusicPlaying();
  });

  /** Total queue length as "1hr 34 min" style text (visual header). */
  durationLabel = computed(() => {
    const seconds = this.totalDuration();

    if (!seconds) return '';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);

    return hours > 0 ? `${hours}hr ${minutes} min` : `${minutes} min`;
  });

  formatTrackDuration(seconds: number | undefined) {
    if (seconds === undefined) return '—';

    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);

    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /** Plays this playlist starting at the clicked track (official behavior). */
  playTrack(track: MusicSource) {
    const playlist = this.playlist();

    if (!playlist) return;

    this._playlistPlayer.changePlaylistSource(playlist, true, track.id);
  }
}
