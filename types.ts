
export type Point = { x: number; y: number };
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  POEM_GENERATION = 'POEM_GENERATION',
  IMAGE_GENERATION = 'IMAGE_GENERATION',
  FINISHED = 'FINISHED'
}

export interface FoodItem {
  pos: Point;
  word: string;
}
