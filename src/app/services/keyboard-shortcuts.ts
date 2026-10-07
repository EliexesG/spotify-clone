import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { MusicPlayer } from './music-player';
import { PlaylistPlayer } from './playlist-player';

/** Keyboard seek step in seconds */
const SEEK_STEP = 5;
/** Keyboard volume step (0–1 scale) */
const VOLUME_STEP = 0.1;

/**
 * Global keyboard shortcuts for playback (official desktop parity subset):
 * Space play/pause, arrows seek/volume, M mute, S shuffle, R repeat,
 * N/P next/previous. Handlers route through the player facades; no new
 * state except the enabled flag. Text inputs are never hijacked.
 *
 * Instantiated once by the Scaffold (injection context required for
 * takeUntilDestroyed-style cleanup via DestroyRef).
 */
@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcuts {
  private readonly _musicPlayer = inject(MusicPlayer);
  private readonly _playlistPlayer = inject(PlaylistPlayer);

  /** Whether shortcuts are active (future toggles/settings can flip it) */
  readonly enabled = signal(true);

  /** Open state of the shortcuts overlay (drives the modal + suspension) */
  readonly helpOpen = signal(false);

  /** Stable handler reference so it can be detached on destroy */
  private readonly _onKeydown = (event: KeyboardEvent) => this.handle(event);

  constructor() {
    document.addEventListener('keydown', this._onKeydown);
    inject(DestroyRef).onDestroy(() =>
      document.removeEventListener('keydown', this._onKeydown),
    );
  }

  /**
   * Dispatches a key event to its shortcut.
   *
   * While the shortcuts overlay is open, playback shortcuts suspend and
   * only Escape closes — prevents stacked double-actions while reading.
   *
   * @param event - The DOM keyboard event to interpret.
   */
  handle(event: KeyboardEvent) {
    // * Snap focus on anything that can receive text: do not disturb
    if (!this.enabled()) return;
    if (this._isTypingTarget(event.target)) return;

    // * Overlay trigger keys first (? = Shift+, or plain ?)
    if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.helpOpen.update((open) => !open);
      return;
    }

    // * While the overlay is open only Escape acts (closes)
    if (this.helpOpen()) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.helpOpen.set(false);
      }

      return;
    }

    switch (event.key) {
      case ' ':
        event.preventDefault();
        this._musicPlayer.isMusicPlaying()
          ? this._musicPlayer.pauseMusic()
          : this._musicPlayer.playMusic();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this._seekBy(SEEK_STEP);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this._seekBy(-SEEK_STEP);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this._volumeBy(VOLUME_STEP);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this._volumeBy(-VOLUME_STEP);
        break;
      case 'm':
      case 'M':
        this._musicPlayer.toggleMute();
        break;
      case 's':
      case 'S':
        if (this._playlistPlayer.playlistSource())
          this._playlistPlayer.toggleShuffle();
        break;
      case 'r':
      case 'R':
        if (this._playlistPlayer.playlistSource())
          this._playlistPlayer.toggleRepeat();
        break;
      case 'n':
      case 'N':
        if (this._playlistPlayer.playlistSource())
          this._playlistPlayer.playNextMusic();
        break;
      case 'p':
      case 'P':
        if (this._playlistPlayer.playlistSource())
          this._playlistPlayer.playPreviousMusic();
        break;
      case 'Escape':
        // * Nothing to close yet beyond the overlay handled above
        break;
    }
  }

  /**
   * Closes the overlay from a backdrop click (kept here so the open state
   * has exactly one owner).
   */
  closeOverlay() {
    this.helpOpen.set(false);
  }

  /** Whether the event target is a text-entry element (shortcuts yield) */
  private _isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;

    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target.isContentEditable
    );
  }

  /**
   * Seeks by a delta, clamped to [0, duration] (the underlying API throws
   * out-of-range; keyboard seeking must never hit that).
   *
   * @param delta - Seconds to add to the current position (may be negative).
   */
  private _seekBy(delta: number) {
    if (!this._musicPlayer.musicSource()) return;

    const current = this._musicPlayer.currentTime().currentTime;
    const duration = this._musicPlayer.duration();

    this._musicPlayer.changeCurrentTime(
      Math.min(Math.max(current + delta, 0), duration),
    );
  }

  /**
   * Changes volume by a delta, clamped to [0, 1] (the underlying API throws
   * out-of-range; keyboard volume steps should never hit that).
   *
   * @param delta - Volume delta on the 0–1 scale (may be negative).
   */
  private _volumeBy(delta: number) {
    this._musicPlayer.changeVolume(
      Math.min(Math.max(this._musicPlayer.volume() + delta, 0), 1),
    );
  }
}
