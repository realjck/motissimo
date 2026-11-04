
export interface Word {
  clue: string;
  answer: string;
  direction: 'across' | 'down';
  row: number;
  col: number;
  number: number;
}

export interface CrosswordData {
  words: Word[];
  size: number;
  theme?: string;
  categoryImage?: string;
  id?: string;
}

export interface CellData {
  isBlack: boolean;
  number?: number;
  char?: string; // The correct character for this cell
  acrossWordIndex?: number;
  downWordIndex?: number;
}

export interface ActiveCell {
  row: number;
  col: number;
}
