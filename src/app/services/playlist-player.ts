import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
} from '@angular/core';
import { PlaylistSource } from '../interfaces/playlist-source';
import { MusicPlayer } from './music-player';

@Injectable({
  providedIn: 'root',
})
export class PlaylistPlayer {
  // * Services
  private readonly _musicPlayer = inject(MusicPlayer);

  // * Signals
  private readonly _playlistSource = signal<PlaylistSource | null>(null);

  //#region Computed
  currentMusicPlaying = computed(() => {
    const musicSource = this._musicPlayer.musicSource();
    const isMusicPlaying = this._musicPlayer.isMusicPlaying();

    if (isMusicPlaying && musicSource) return musicSource;
    else return null;
  });

  currentMusicIndex = computed(() => {
    const playlist = this._playlistSource();
    const currentMusic = this.currentMusicPlaying();

    if (!playlist || !currentMusic) return 0;

    return playlist.music.indexOf(currentMusic);
  });

  hasNextMusic = computed(() => {
    return (
      this.currentMusicIndex() < (this.playlistSource()?.music?.length || 0) - 1
    );
  });

  hasPreviousMusic = computed(() => this.currentMusicIndex() > 0);
  //#endregion

  //#region Getters
  get playlistSource(): Signal<PlaylistSource | null> {
    return this._playlistSource.asReadonly();
  }
  //#endregion

  /**
   * Plays the next music track in the playlist.
   *
   * This function checks if there is a next music track available in the
   * current playlist. If a next track exists, it updates the music source
   * to the next track and starts playing it. If there is no next track, the
   * function does nothing.
   */
  playNextMusic() {
    if (!this.hasNextMusic()) return;

    this._musicPlayer.changeMusicSource(
      this.playlistSource()?.music[this.currentMusicIndex() + 1] || null,
    );

    this._musicPlayer.playMusic();
  }

  /**
   * Plays the previous music track in the playlist.
   *
   * This function checks if there is a previous music track available in the
   * current playlist. If a previous track exists, it updates the music source
   * to the previous track and starts playing it. If there is no previous track,
   * the function returns early without making any changes.
   */
  playPreviousMusic() {
    if (!this.hasPreviousMusic()) return;

    this._musicPlayer.changeMusicSource(
      this.playlistSource()?.music[this.currentMusicIndex() - 1] || null,
    );

    this._musicPlayer.playMusic();
  }

  /**
   * Changes the current playlist and optionally plays the specified music.
   *
   * This function updates the internal playlist source signal with the provided
   * playlist object. It also identifies the music to be set as the current music
   * source, based on the provided music ID. If a specific music ID is not found
   * within the playlist, the first music in the playlist is selected as the current
   * music source. If the playlist is null, the current music source is cleared.
   *
   * Optionally, if the play parameter is set to true, the function will start
   * playing the current music immediately.
   *
   * @param playlist - The new playlist source to be set, or null to clear the current
   *                   playlist source.
   * @param musicId - The ID of the music to be set as the current music source. If
   *                  empty or not found, defaults to the first music in the playlist.
   * @param play - A boolean indicating whether to play the current music immediately
   *               after changing the playlist.
   */
  changePlaylistSource(
    playlist: PlaylistSource | null,
    musicId = '',
    play = false,
  ) {
    this._playlistSource.set(playlist);

    const musicSource =
      playlist?.music.find((music) => music.id === musicId) ||
      playlist?.music[0] ||
      null;

    this._musicPlayer.changeMusicSource(musicSource);

    if (play) this._musicPlayer.playMusic();
  }
}
