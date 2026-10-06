import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AudioResolver } from './audio-resolver';

/**
 * Flushes the zoneless scheduler so signal effects (the seek writer) run.
 */
const flushEffects = () => new Promise((r) => setTimeout(r, 0));

describe('AudioResolver (scrub)', () => {
  let resolver: AudioResolver;

  beforeEach(() => {
    // * jsdom doesn't implement media playback; stub to keep the output clean
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(
      () => ({}) as Promise<void>,
    );
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    // * Fixed duration so changeAudioCurrentTime accepts in-range seconds
    vi.spyOn(HTMLMediaElement.prototype, 'duration', 'get').mockReturnValue(180);

    TestBed.configureTestingModule({});
    resolver = TestBed.inject(AudioResolver);
    resolver.setAudio('test.mp3');

    // * Simulate a loaded media element: the canplay listener feeds the
    // * duration signal that changeAudioCurrentTime validates against
    (resolver as any)._audio
      .getValue()
      .dispatchEvent(new Event('canplay'));
  });

  it('seeks immediately when the time changes without scrubbing (keyboard path)', async () => {
    resolver.changeAudioCurrentTime(30);
    await flushEffects();

    const audio = (resolver as any)._audio.getValue();
    expect(audio.currentTime).toBe(30);
  });

  it('pauses on beginScrub and only previews while scrubbing (no element seek, no sound)', async () => {
    resolver.reproduceAudio();
    expect(resolver.audioReproducing()).toBe(true);

    resolver.beginScrub();

    // * Was playing -> paused for the duration of the drag
    expect(resolver.audioReproducing()).toBe(false);

    // * Preview updates the signal but must not touch the element
    resolver.changeAudioCurrentTime(120);
    await flushEffects();

    const audio = (resolver as any)._audio.getValue();
    expect(resolver.audioCurrentTime().currentTime).toBe(120);
    expect(audio.currentTime).not.toBe(120);
  });

  it('applies the last previewed position and resumes playback on endScrub', async () => {
    resolver.reproduceAudio();
    resolver.beginScrub();
    resolver.changeAudioCurrentTime(120);
    resolver.endScrub();
    await flushEffects();

    const audio = (resolver as any)._audio.getValue();
    expect(audio.currentTime).toBe(120);
    expect(resolver.audioReproducing()).toBe(true);
  });

  it('stale timeupdate events during a scrub cannot clobber the preview', async () => {
    resolver.reproduceAudio();
    await flushEffects();

    resolver.beginScrub();
    resolver.changeAudioCurrentTime(120);

    // * Simulates a timeupdate queued before the scrub pause firing late:
    // * the element is still at its old position
    const audio = (resolver as any)._audio.getValue();
    audio.dispatchEvent(new Event('timeupdate'));
    await flushEffects();

    expect(resolver.audioCurrentTime().currentTime).toBe(120);
  });

  it('endScrub commits the explicit value even if the preview was clobbered', async () => {
    resolver.reproduceAudio();
    await flushEffects();

    resolver.beginScrub();
    resolver.changeAudioCurrentTime(120);

    // * Preview gets clobbered by a stale update
    const audio = (resolver as any)._audio.getValue();
    audio.dispatchEvent(new Event('timeupdate'));
    await flushEffects();

    // * Commit carries the DOM value from the slider release
    resolver.endScrub(120);
    await flushEffects();

    expect(audio.currentTime).toBe(120);
    expect(resolver.audioReproducing()).toBe(true);
  });

  it('endScrub with an unchanged committed position skips the seek but resumes', async () => {
    const seekWrites: number[] = [];
    resolver.reproduceAudio();
    await flushEffects();

    const audio = (resolver as any)._audio.getValue();
    const original = audio.currentTime;
    Object.defineProperty(audio, 'currentTime', {
      get: () => original,
      set: (v: number) => seekWrites.push(v),
      configurable: true,
    });

    resolver.beginScrub();
    // * Click without value change: nothing previewed, commit equals position
    resolver.endScrub(original);
    await flushEffects();

    expect(seekWrites.length).toBe(0);
    expect(resolver.audioReproducing()).toBe(true);

    Object.defineProperty(audio, 'currentTime', {
      get: () => original,
      set: Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime')!.set!,
      configurable: true,
    });
  });

  it('does not resume on endScrub when the audio was paused before the scrub', async () => {
    // * Not playing: beginScrub must not arm the resume flag
    resolver.beginScrub();
    resolver.changeAudioCurrentTime(90);
    resolver.endScrub();
    await flushEffects();

    const audio = (resolver as any)._audio.getValue();
    expect(audio.currentTime).toBe(90);
    expect(resolver.audioReproducing()).toBe(false);
  });

  it('treats endScrub without beginScrub as a no-op', async () => {
    resolver.endScrub();

    resolver.changeAudioCurrentTime(15);
    await flushEffects();

    const audio = (resolver as any)._audio.getValue();
    expect(audio.currentTime).toBe(15);
  });
});
