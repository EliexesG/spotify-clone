import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { LibraryCardVariant } from './library-card.model';
import { MusicSource } from '../../../interfaces/music-source';
import { PlaylistSource } from '../../../interfaces/playlist-source';
import { CommonModule } from '@angular/common';
import { PlaylistPlayer } from '../../../services/playlist-player';
import { MusicPlayer } from '../../../services/music-player';

@Component({
  selector: 'app-library-card',
  imports: [CommonModule],
  templateUrl: './library-card.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './library-card.scss',
})
export class LibraryCard {
  private readonly _playlistPlayer = inject(PlaylistPlayer);
  private readonly _musicPlayer = inject(MusicPlayer);

  // * Inputs
  variant = input<LibraryCardVariant>('with-description');
  source = input<PlaylistSource | MusicSource>();
  background = input<boolean>(false);

  // * Computed
  title = computed(() => this.source()?.title || 'Title');

  subtitle = computed(() => {
    const source = this.source();

    if (this.isMusic(source)) return `Music • ${source.artist}`;
    if (this.isPlaylist(source)) return `Playlist • ${source.owner}`;

    return 'Subtitle';
  });

  img = computed(() => this.source()?.img);

  isPlaying = computed(() => {
    const source = this.source();
    const isPlaying = this._musicPlayer.isMusicPlaying();
    const musicSource = this._musicPlayer.musicSource();
    const playlistSource = this._playlistPlayer.playlistSource();

    if (this.isMusic(source) && source.id === musicSource?.id && isPlaying) {
      return true;
    } else if (
      this.isPlaylist(source) &&
      source.id === playlistSource?.id &&
      isPlaying
    ) {
      return true;
    }

    return false;
  });

  // * State
  hover = signal(false);
  imgError = signal(false);
  card = viewChild<ElementRef<HTMLDivElement>>('card');

  constructor() {
    effect(() => {
      const card = this.card()?.nativeElement;

      // * Track source changes only; the imgError write must NOT depend on
      // * imgError itself or the reset would clear the just-raised error
      this.source();
      untracked(() => this.imgError.set(false));

      if (!card) return;

      card.onmouseleave = () => {
        this.hover.set(false);
      };

      card.onmouseenter = () => {
        this.hover.set(true);
      };
    });
  }

  /**
   * Plays the music or playlist.
   *
   * Music cards compare exclusively against the current music source and
   * playlist cards exclusively against the current playlist source:
   * playlist ids and music ids live in different namespaces
   * (both are plain strings like "2") and must never be compared.
   */
  play() {
    const source = this.source();

    if (this.isMusic(source)) {
      if (source.id !== this._musicPlayer.musicSource()?.id) {
        this._musicPlayer.changeMusicSource(source);
      }

      this._musicPlayer.playMusic();
      return;
    }

    if (this.isPlaylist(source)) {
      if (source.id !== this._playlistPlayer.playlistSource()?.id) {
        this._playlistPlayer.changePlaylistSource(source, true);
        return;
      }

      this._musicPlayer.playMusic();
    }
  }

  pause() {
    this._musicPlayer.pauseMusic();
  }

  private isMusic(
    source: PlaylistSource | MusicSource | undefined,
  ): source is MusicSource {
    if (!source) return false;
    return 'artist' in source;
  }

  private isPlaylist(
    source: PlaylistSource | MusicSource | undefined,
  ): source is PlaylistSource {
    if (!source) return false;
    return 'owner' in source;
  }
}
