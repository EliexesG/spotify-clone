export interface currentTime {
  currentTime: number;
  cause: currentTimeCause;
}

export type currentTimeCause = 'reproduction' | 'controller';
