// components/slogansData.ts

export interface Slogan {
  id: number;
  text: string;
  highlightWord: string | string[]; // Can be single word or array of words
}

export const HARDCODED_SLOGANS: Slogan[] = [
  {
    id: 1,
    text: "WELCOME HOME",
    highlightWord: "HOME"
  },
  {
    id: 2,
    text: "BOKAMOSO BJA HAO BO THOMA MONA",
    highlightWord: ["BOKAMOSO", "THOMA"] // Array for multiple highlighted words
  },
  {
    id: 3,
    text: "YAKHA IKUSASA LAKHO",
    highlightWord: "IKUSASA"
  },
  {
    id: 4,
    text: "LEARN TODAY LEAD TOMORROW",
    highlightWord: ["LEARN", "LEAD"] // Array for multiple highlighted words
  }
];