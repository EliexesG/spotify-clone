import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
} from '@angular/core';
import { PlaylistSource } from '../interfaces/playlist-source';
import { MusicPlayer } from './music-player';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AudioResolver } from './audio-resolver';

@Injectable({
  providedIn: 'root',
})
export class PlaylistPlayer {
  private destroy$ = inject(DestroyRef);

  // * Services
  private readonly _musicPlayer = inject(MusicPlayer);
  private readonly _audioResolver = inject(AudioResolver);

  // * Signals
  private readonly _playlistSource = signal<PlaylistSource | null>(null);
  private readonly _alreadyPlayedMusicIndexes = signal<number[]>([]);
  private readonly _isShuffle = signal(false);

  //#region Computed
  currentMusicIndex = computed(() => {
    const playlist = this._playlistSource();
    const currentMusic = this._musicPlayer.musicSource();

    if (!playlist || !currentMusic) return 0;

    // * Match by id: reference identity breaks as soon as any mapping/copy
    // * happens in the query helpers
    const index = playlist.music.findIndex(
      (music) => music.id === currentMusic.id,
    );

    if (index === -1) return 0;

    return index;
  });
  //#endregion

  //#region Getters
  get playlistSource(): Signal<PlaylistSource | null> {
    return this._playlistSource.asReadonly();
  }

  get alreadyPlayedMusicIndexes(): Signal<number[]> {
    return this._alreadyPlayedMusicIndexes.asReadonly();
  }

  get isShuffle(): Signal<boolean> {
    return this._isShuffle.asReadonly();
  }
  //#endregion

  /**
   * The constructor of the service.
   *
   * It sets up the behavior of the service. When the audio element is ended,
   * it plays the next music in the playlist. When the music player is playing,
   * it adds the current music index to the already played music indexes.
   */
  constructor() {
    // * Auto-advance when the current song ends; subscribing to the resolver's
    // * ended stream instead of overwriting audio.onended keeps both owners alive
    this._audioResolver.audioEnded
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe(() => {
        if (this._playlistSource()) this.playNextMusic();
      });

    // * For reproduction in case it was triggered somewhere else
    effect(() => {
      const isPlaying = this._musicPlayer.isMusicPlaying();
      const currentIndex = this.currentMusicIndex();

      if (isPlaying) this.addMusicToAlreadyPlayed(currentIndex);
    });
  }

  /**
   * Plays the next music in the playlist.
   *
   * This function changes the current music source to the next music in the
   * playlist. If the playlist is shuffled, it picks a random music ID from the
   * list of music IDs that have not been played yet. If the playlist is not
   * shuffled, it plays the next music in the list of music IDs.
   *
   * If the playlist is empty, it does nothing.
   */
  playNextMusic() {
    this._musicPlayer.changeMusicSource(
      this.playlistSource()?.music[this.calculateNextMusicIndex()] || null,
    );

    this._musicPlayer.playMusic();
  }

  /**
   * Plays the previous music in the playlist.
   *
   * This function changes the current music source to the previous music in the
   * playlist. If the playlist is shuffled, it selects the first music. If the
   * playlist is not shuffled, it plays the previous music in the list of music
   * IDs.
   *
   * If the playlist is empty, it does nothing.
   */
  playPreviousMusic() {
    this._musicPlayer.changeMusicSource(
      this.playlistSource()?.music[this.calculatePreviousMusicIndex()] || null,
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
    play = false,
    musicId = '',
  ) {
    this._playlistSource.set(playlist);

    const musicSource =
      playlist?.music.find((music) => music.id === musicId) ||
      playlist?.music[0] ||
      null;

    this._musicPlayer.changeMusicSource(musicSource);

    if (play) this._musicPlayer.playMusic();
  }

  /**
   * Adds the given music index to the list of already played music indexes.
   *
   * This function appends the provided index to the internal list of already
   * played music indexes, ensuring that the index is not undefined and not
   * already present in the list.
   *
   * @param index - The index of the music to be added to the list of already
   *                played music indexes. If undefined or already present, no
   *                changes are made.
   */
  addMusicToAlreadyPlayed(index: number | undefined) {
    if (
      index === undefined ||
      this._alreadyPlayedMusicIndexes().includes(index)
    )
      return;

    this._alreadyPlayedMusicIndexes.update((value) => [...value, index]);
  }

  /**
   * Removes the given music index from the list of already played music indexes.
   *
   * This function filters the internal list of already played music indexes to
   * remove the provided index.
   *
   * @param index - The index of the music to be removed from the list of already
   *                played music indexes. If the index is not present, no changes
   *                are made.
   */
  removeMusicFromAlreadyPlayed(index: number) {
    this._alreadyPlayedMusicIndexes.update((value) =>
      value.filter((i) => i !== index),
    );
  }

  /**
   * Toggles the shuffle state of the playlist.
   *
   * This function toggles the shuffle state of the playlist and updates the
   * internal signal accordingly.
   */
  toggleShuffle() {
    this._isShuffle.update((value) => !value);
  }

  /**
   * Calculates the index of the next music to be played in the playlist.
   *
   * This function determines the next music index based on the current
   * shuffle state and the list of already played music. If shuffle is
   * enabled, it selects a random index that hasn't been played yet. If
   * all music has been played, it resets the already played list. If
   * shuffle is not enabled, it simply increments the index to the next
   * unplayed music in the playlist. Returns the index of the next music
   * to be played.
   *
   * @returns The index of the next music in the playlist.
   */
  private calculateNextMusicIndex(): number {
    const playlist = this.playlistSource()?.music;

    if (!playlist?.length) return 0;

    const currentIndex = this.currentMusicIndex();
    const shuffle = this.isShuffle();

    // * Cycle: when everything was played, start a new round
    if (this._alreadyPlayedMusicIndexes().length >= playlist.length)
      this._alreadyPlayedMusicIndexes.set([]);

    if (!shuffle)
      return currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;

    // * Shuffle: iterate over a pool of candidates instead of recursing
    // * (a single-song playlist would busy-loop the previous implementation)
    const candidates = playlist
      .map((_, index) => index)
      .filter(
        (index) =>
          index !== currentIndex &&
          !this._alreadyPlayedMusicIndexes().includes(index),
      );

    if (!candidates.length) {
      this._alreadyPlayedMusicIndexes.set([]);

      const others = playlist
        .map((_, index) => index)
        .filter((index) => index !== currentIndex);

      // * Single-song playlist: replay it
      if (!others.length) return currentIndex;

      return others[Math.floor(Math.random() * others.length)];
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /**
   * Calculates the previous music index based on the current shuffle state
   * and the list of already played music. If shuffle is not enabled, it
   * simply decrements the index to the previous unplayed music in the
   * playlist. If shuffle is enabled, it selects the last played music in
   * the already played list, or 0 if the list is empty. Returns the index
   * of the previous music to be played.
   *
   * @returns The index of the previous music in the playlist.
   */
  private calculatePreviousMusicIndex(): number {
    const playlist = this.playlistSource()?.music;
    const currentIndex = this.currentMusicIndex();

    let index = 0;

    if (!playlist) return index;

    this.removeMusicFromAlreadyPlayed(currentIndex);
    const alreadyPlayedMusic = this._alreadyPlayedMusicIndexes();

    index = alreadyPlayedMusic[alreadyPlayedMusic.length - 1] || 0;

    return index;
  }
}
