export interface CurrentTime {
  currentTime: number;
  cause: currentTimeCause;
}

export type currentTimeCause = 'reproduction' | 'controller';
