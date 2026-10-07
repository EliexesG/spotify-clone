import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PlaylistPlayer } from './playlist-player';
import { MusicPlayer } from './music-player';
import { AudioResolver } from './audio-resolver';
import { PlaylistSource } from '../interfaces/playlist-source';
import { MusicSource } from '../interfaces/music-source';

const track = (id: string): MusicSource => ({
  id,
  title: `Song ${id}`,
  artist: 'tester',
  img: '',
  url: '',
});

const fakePlaylist = (trackIds: string[]): PlaylistSource => ({
  id: 'test-playlist',
  title: 'Test Playlist',
  description: '',
  owner: 'tester',
  img: '',
  music: trackIds.map((id) => track(id)),
});

describe('PlaylistPlayer', () => {
  let player: PlaylistPlayer;
  let musicPlayer: MusicPlayer;

  beforeEach(() => {
    // * jsdom doesn't implement media playback; stub to keep the output clean
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(
      () => ({}) as Promise<void>,
    );
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});

    TestBed.configureTestingModule({});
    player = TestBed.inject(PlaylistPlayer);
    musicPlayer = TestBed.inject(MusicPlayer);
  });

  it('loads the first track of a playlist without playing it', () => {
    player.changePlaylistSource(fakePlaylist(['a', 'b']), false);

    expect(player.playlistSource()?.id).toBe('test-playlist');
    expect(musicPlayer.musicSource()?.id).toBe('a');
    expect(musicPlayer.isMusicPlaying()).toBe(false);
  });

  it('computes the current index by id even when track objects are copies', () => {
    const playlist = fakePlaylist(['a', 'b', 'c']);

    player.changePlaylistSource(playlist, false, 'b');
    expect(player.currentMusicIndex()).toBe(1);

    // * New source object holding copies: reference equality would fail here
    player.changePlaylistSource(
      { ...playlist, music: playlist.music.map((m) => ({ ...m })) },
      false,
      'b',
    );

    expect(musicPlayer.musicSource()?.id).toBe('b');
    expect(player.currentMusicIndex()).toBe(1);
  });

  it('advances to the next track (non-shuffle)', () => {
    player.changePlaylistSource(fakePlaylist(['a', 'b', 'c']), false);

    player.playNextMusic();

    expect(musicPlayer.musicSource()?.id).toBe('b');
  });

  it('wraps to the first track when the last one advances (non-shuffle)', () => {
    player.changePlaylistSource(fakePlaylist(['a', 'b']), false, 'b');

    player.playNextMusic();

    expect(musicPlayer.musicSource()?.id).toBe('a');
  });

  it('does not hang with a single-track shuffled playlist (regression: recursion)', () => {
    player.changePlaylistSource(fakePlaylist(['a']), false);
    player.toggleShuffle();

    player.playNextMusic();
    player.playNextMusic();

    expect(musicPlayer.musicSource()?.id).toBe('a');
  });

  it('plays every track of the playlist under shuffle', async () => {
    player.changePlaylistSource(fakePlaylist(['a', 'b', 'c']), false);
    player.toggleShuffle();

    const played: string[] = [];
    for (let i = 0; i < 3; i++) {
      player.playNextMusic();
      // * Flush the zoneless scheduler (effects) via a macrotask
      await new Promise((r) => setTimeout(r, 0));
      played.push(musicPlayer.musicSource()!.id);
    }

    expect(new Set(played)).toEqual(new Set(['a', 'b', 'c']));
  });

  it('stops playback and resets the audio state when the music source is cleared (regression: audio kept playing)', () => {
    player.changePlaylistSource(fakePlaylist(['a', 'b']), true);
    expect(musicPlayer.isMusicPlaying()).toBe(true);

    musicPlayer.changeMusicSource(null);

    expect(musicPlayer.musicSource()).toBeNull();
    expect(musicPlayer.isMusicPlaying()).toBe(false);
    expect(musicPlayer.duration()).toBe(0);
  });

  describe('repeat modes', () => {
    /** Fires the resolver's `ended` event as a real track end would */
    const endTrack = async () => {
      const audio = (TestBed.inject(AudioResolver) as any)._audio.getValue();
      audio.dispatchEvent(new Event('ended'));
      // * Flush the zoneless scheduler (effects) via a macrotask
      await new Promise((r) => setTimeout(r, 0));
    };

    it('cycles off → all → one → off', () => {
      expect(player.repeatMode()).toBe('off');

      player.toggleRepeat();
      expect(player.repeatMode()).toBe('all');

      player.toggleRepeat();
      expect(player.repeatMode()).toBe('one');

      player.toggleRepeat();
      expect(player.repeatMode()).toBe('off');
    });

    it('auto-advances with repeat off and stops at the end of the queue', async () => {
      player.changePlaylistSource(fakePlaylist(['a', 'b']), false, 'b');
      musicPlayer.playMusic();

      await endTrack();

      // * No wrap: the last track stays loaded and playback stops
      expect(musicPlayer.musicSource()?.id).toBe('b');
      expect(musicPlayer.isMusicPlaying()).toBe(false);
    });

    it('auto-advances with repeat all and wraps to the first track', async () => {
      player.changePlaylistSource(fakePlaylist(['a', 'b']), false, 'b');
      player.toggleRepeat(); // off → all
      musicPlayer.playMusic();

      await endTrack();

      expect(musicPlayer.musicSource()?.id).toBe('a');
      expect(musicPlayer.isMusicPlaying()).toBe(true);
    });

    it('replays the current track with repeat one', async () => {
      player.changePlaylistSource(fakePlaylist(['a', 'b']), false, 'b');
      player.toggleRepeat(); // off → all
      player.toggleRepeat(); // all → one
      musicPlayer.playMusic();

      const spy = vi.spyOn(musicPlayer, 'restartMusic');

      await endTrack();

      expect(musicPlayer.musicSource()?.id).toBe('b');
      expect(spy).toHaveBeenCalled();
    });

    it('still wraps on manual next when repeat is off', () => {
      player.changePlaylistSource(fakePlaylist(['a', 'b']), false, 'b');

      player.playNextMusic(); // manual: no repeat policy

      expect(musicPlayer.musicSource()?.id).toBe('a');
    });
  });
});
