import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { SourceCardVariant } from './source-card.model';
import { MusicSource } from '../../../interfaces/music-source';
import { PlaylistSource } from '../../../interfaces/playlist-source';
import { CommonModule } from '@angular/common';
import { PlaylistPlayer } from '../../../services/playlist-player';
import { MusicPlayer } from '../../../services/music-player';
import { ImageFallback } from '../image-fallback/image-fallback';

/**
 * Music/playlist-agnostic source card used in the sidebar rows and the
 * home grid. Renders metadata (title/subtitle/cover with image-fallback),
 * tracks hover state, and wires playback (cover) + navigation (row body)
 * through MusicPlayer/PlaylistPlayer/Router.
 */
@Component({
  selector: 'app-source-card',
  imports: [CommonModule, ImageFallback],
  templateUrl: './source-card.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './source-card.scss',
})
export class SourceCard {
  private readonly _playlistPlayer = inject(PlaylistPlayer);
  private readonly _musicPlayer = inject(MusicPlayer);
  private readonly _router = inject(Router);

  // * Inputs
  /** Card visual variant (collapsed row / description row / big grid card) */
  variant = input<SourceCardVariant>('with-description');
  /** The media source displayed (playlist or music) */
  source = input<PlaylistSource | MusicSource>();

  // * Computed
  /** Card title (falls back to a placeholder) */
  title = computed(() => this.source()?.title || 'Title');

  /** "artist" (music) / "Playlist • owner" line (kind via type guard) */
  subtitle = computed(() => {
    const source = this.source();

    if (this.isMusic(source)) return source.artist;
    if (this.isPlaylist(source)) return `Playlist • ${source.owner}`;

    return 'Subtitle';
  });

  /** Cover URL (optional in data) */
  img = computed(() => this.source()?.img);

  /** True when THIS source is the one currently playing */
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
  /** Mouse-over state (drives the floating play button + highlights) */
  hover = signal(false);
  /** Outer card element (hover wiring) */
  card = viewChild<ElementRef<HTMLDivElement>>('card');

  constructor() {
    effect(() => {
      const card = this.card()?.nativeElement;

      if (!card) return;

      // * Prop-driven hover wiring keeps the mouse state in Angular signals
      card.onmouseenter = () => {
        this.hover.set(true);
      };

      card.onmouseleave = () => {
        this.hover.set(false);
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

  /**
   * Opens the source (official-app behavior for library rows): playlist
   * cards navigate to their detail view and load the queue without
   * playing; music cards have no detail route, so the row jumps playback
   * to that track (queue-row behavior). The cover keeps its dedicated
   * play/pause handling.
   */
  open() {
    const source = this.source();

    if (this.isMusic(source)) {
      this.play();
      return;
    }

    if (!this.isPlaylist(source)) return;

    this._router.navigate(['/playlist', source.id]);

    // * Opening the playlist that is already loaded must not disturb playback
    if (this._playlistPlayer.playlistSource()?.id !== source.id) {
      this._playlistPlayer.changePlaylistSource(source, false);
    }
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
