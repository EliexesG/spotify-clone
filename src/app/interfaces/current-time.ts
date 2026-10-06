/**
 * Playback-position state shared between the audio element and the UI.
 */
export interface CurrentTime {
  /** Current element position in seconds */
  currentTime: number;
  /** Who moved the position: the element itself or a controller call */
  cause: currentTimeCause;
}

/**
 * Origin of a position change: 'reproduction' (element playback/seek) or
 * 'controller' (slider/programmatic sets — these write to the element).
 */
export type currentTimeCause = 'reproduction' | 'controller';
